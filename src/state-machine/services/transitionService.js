import {
  TRANSITIONS, FORK_EVENTS, COMPLETE_EVENTS,
  EVENT_TO_FORK_TYPE, EVENT_TO_COMPLETE_TYPE, MAIN_STATES_WITH_FORKS,
} from '../config/transitions';
import {
  getReferenceState, getReference, upsertReferenceState, insertHistory,
} from '../lib/supabase';
import { evaluateAlert } from './alertService';
import { getThreshold } from './thresholdService';
import { STATE_LABELS } from '../lib/states';

export function isValidTransition(currentState, event) {
  const stateTransitions = TRANSITIONS[currentState];
  if (!stateTransitions) return false;
  return event in stateTransitions;
}

export function getAvailableEvents(currentState, stateRecord) {
  const stateTransitions = TRANSITIONS[currentState];
  if (!stateTransitions) return [];

  return Object.keys(stateTransitions).filter(event => {
    if (FORK_EVENTS.includes(event)) {
      const forkType = EVENT_TO_FORK_TYPE[event];
      if (stateRecord?.sub_states?.includes(forkType)) return false;
      if (stateRecord?.completed_sub_states?.includes(forkType)) return false;
    }
    if (COMPLETE_EVENTS.includes(event)) {
      const forkType = EVENT_TO_COMPLETE_TYPE[event];
      if (!stateRecord?.sub_states?.includes(forkType)) return false;
    }
    if (event === 'MERGE_UNION') {
      return stateRecord?.waiting_for_merge === true;
    }
    if (event === 'REANUDAR') {
      return currentState === 'pausado' && stateRecord?.previous_state;
    }
    return true;
  });
}

export function requiresJustification(stateRecord, payload) {
  const oldInitial = stateRecord?.consumption_initial;
  const oldCM = stateRecord?.consumption_contramuestra;
  const newInitial = payload?.consumptionInitial;
  const newCM = payload?.consumptionContramuestra;

  if (newInitial !== undefined && Number(newInitial) !== Number(oldInitial)) return true;
  if (newCM !== undefined && Number(newCM) !== Number(oldCM)) return true;
  return false;
}

export async function transition(referenceId, event, payload = {}) {
  const { data: stateRecord, error: stateErr } = await getReferenceState(referenceId);
  if (stateErr) throw new Error(`Error al obtener estado: ${stateErr.message}`);

  if (!stateRecord) {
    throw new Error(`No existe estado para la referencia ${referenceId}. Inicialice la SM primero.`);
  }

  const currentState = stateRecord.current_state;
  if (!isValidTransition(currentState, event)) {
    throw new Error(
      `Transición "${event}" no permitida desde el estado "${STATE_LABELS[currentState] || currentState}"`
    );
  }

  const needsJustification = requiresJustification(stateRecord, payload);
  if (needsJustification && !payload.justification?.trim()) {
    throw new Error(
      'La justificación es obligatoria porque los consumos han cambiado. '
      + 'Describa el motivo del cambio (ej: "Se añadió forro interno").'
    );
  }

  const now = new Date().toISOString();
  const durationMs = stateRecord.timestamp_entry
    ? Date.now() - new Date(stateRecord.timestamp_entry).getTime()
    : 0;

  let toState;
  let isFork = false;
  let isMerge = false;
  let forkType = null;
  let newSubStates = [...(stateRecord.sub_states || [])];
  let newCompletedSubStates = [...(stateRecord.completed_sub_states || [])];
  let newWaitingForMerge = stateRecord.waiting_for_merge || false;
  let newMainTrunkState = stateRecord.main_trunk_state || currentState;

  if (FORK_EVENTS.includes(event)) {
    forkType = EVENT_TO_FORK_TYPE[event];
    if (!newSubStates.includes(forkType)) newSubStates.push(forkType);
    toState = currentState;
    isFork = true;
  } else if (COMPLETE_EVENTS.includes(event)) {
    forkType = EVENT_TO_COMPLETE_TYPE[event];
    newSubStates = newSubStates.filter(s => s !== forkType);
    if (!newCompletedSubStates.includes(forkType)) newCompletedSubStates.push(forkType);

    if (newSubStates.length === 0 && newCompletedSubStates.length > 0) {
      toState = 'union';
      newWaitingForMerge = true;
    } else {
      toState = currentState;
    }
    isMerge = true;
  } else if (event === 'MERGE_UNION') {
    if (!newWaitingForMerge) {
      throw new Error('No hay forks pendientes de unir.');
    }
    toState = newMainTrunkState;
    newCompletedSubStates = [];
    newWaitingForMerge = false;
  } else if (event === 'REANUDAR') {
    toState = stateRecord.previous_state || 'concepto';
  } else {
    toState = TRANSITIONS[currentState][event];
    if (MAIN_STATES_WITH_FORKS.includes(toState)) {
      newMainTrunkState = toState;
    }
  }

  let consumptionInitial = payload.consumptionInitial !== undefined
    ? Number(payload.consumptionInitial)
    : stateRecord.consumption_initial;

  let consumptionContramuestra = payload.consumptionContramuestra !== undefined
    ? Number(payload.consumptionContramuestra)
    : stateRecord.consumption_contramuestra;

  const { alertLevel, consumptionDiff, alertReason } = await evaluateAlert(
    referenceId, consumptionInitial, consumptionContramuestra
  );

  const updatedState = {
    reference_id: referenceId,
    collection_id: stateRecord.collection_id,
    current_state: toState,
    previous_state: currentState,
    main_trunk_state: (event === 'MERGE_UNION' || event === 'REANUDAR')
      ? newMainTrunkState
      : (MAIN_STATES_WITH_FORKS.includes(toState) ? toState : stateRecord.main_trunk_state),
    sub_states: newSubStates,
    completed_sub_states: newCompletedSubStates,
    waiting_for_merge: newWaitingForMerge,
    alert_level: alertLevel,
    alert_reason: alertReason,
    consumption_initial: consumptionInitial,
    consumption_contramuestra: consumptionContramuestra,
    consumption_diff: consumptionDiff,
    threshold_cm: await getThreshold(referenceId),
    assigned_role: payload.assignedRole || stateRecord.assigned_role,
    assigned_person_id: payload.assignedPersonId || stateRecord.assigned_person_id,
    timestamp_entry: ['union', 'pausado'].includes(toState)
      ? stateRecord.timestamp_entry
      : now,
    last_updated: now,
    lifecycle_status: toState === 'cancelado' ? 'cancelled'
      : toState === 'completado' ? 'completed'
      : toState === 'pausado' ? 'paused'
      : 'active',
  };

  const consumptionChange = (needsJustification || consumptionDiff > 0)
    ? {
        before: Number(stateRecord.consumption_initial || 0),
        after: consumptionInitial,
        contramuestraBefore: Number(stateRecord.consumption_contramuestra || 0),
        contramuestraAfter: consumptionContramuestra,
        diff: consumptionDiff,
      }
    : null;

  const historyEntry = {
    reference_id: referenceId,
    from_state: currentState,
    to_state: toState,
    event,
    timestamp: now,
    duration_in_previous_ms: durationMs,
    user_id: payload.userId || null,
    user_display_name: payload.userName || null,
    user_role: payload.userRole || null,
    requires_justification: needsJustification,
    justification: needsJustification ? payload.justification : null,
    consumption_change: consumptionChange,
    molderia_changes: payload.molderiaChanges?.length
      ? payload.molderiaChanges
      : null,
    is_parallel_fork: isFork,
    is_parallel_merge: isMerge,
    fork_type: forkType,
  };

  const { error: upsertErr } = await upsertReferenceState(updatedState);
  if (upsertErr) throw new Error(`Error al guardar estado: ${upsertErr.message}`);

  const { error: histErr } = await insertHistory(historyEntry);
  if (histErr) throw new Error(`Error al guardar historial: ${histErr.message}`);

  return updatedState;
}

export async function initializeReference(referenceId, collectionId = null) {
  const { data: existing } = await getReferenceState(referenceId);
  if (existing) return existing;

  if (!collectionId) {
    const { data: ref } = await getReference(referenceId);
    if (ref?.collection_id) collectionId = ref.collection_id;
  }

  const newState = {
    reference_id: referenceId,
    collection_id: collectionId,
    current_state: 'concepto',
    previous_state: null,
    main_trunk_state: 'concepto',
    sub_states: [],
    completed_sub_states: [],
    waiting_for_merge: false,
    alert_level: 'none',
    alert_reason: null,
    consumption_initial: null,
    consumption_contramuestra: null,
    consumption_diff: null,
    threshold_cm: await getThreshold(referenceId),
    assigned_role: null,
    assigned_person_id: null,
    timestamp_entry: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    lifecycle_status: 'active',
  };

  const { data, error } = await upsertReferenceState(newState);
  if (error) throw new Error(`Error al inicializar estado: ${error.message}`);

  await insertHistory({
    reference_id: referenceId,
    from_state: '__init__',
    to_state: 'concepto',
    event: 'INIT',
    timestamp: new Date().toISOString(),
    duration_in_previous_ms: 0,
    is_parallel_fork: false,
    is_parallel_merge: false,
  });

  return data;
}
