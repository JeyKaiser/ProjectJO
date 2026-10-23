import { getAllStates, getPilotStates, getReferencesByIds, getCollections } from '../lib/supabase';
import { STATE_LABELS, ROLE_MAP } from '../lib/states';
import { restrictPilotCollections, PILOT_COLLECTION_CODE } from '../../lib/pilotScope';

let collectionsCache = null;

export function calculateQuietTime(timestampEntry) {
  if (!timestampEntry) return { ms: 0, hours: 0, days: 0, display: '—' };

  const now = Date.now();
  const entry = new Date(timestampEntry).getTime();
  const ms = Math.max(0, now - entry);
  const hours = ms / 3600000;
  const days = hours / 24;

  let display;
  if (days >= 1) {
    const d = Math.floor(days);
    const h = Math.floor(hours % 24);
    display = `${d}d ${h}h`;
  } else if (hours >= 1) {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    display = `${h}h ${m}m`;
  } else {
    const m = Math.floor(ms / 60000);
    display = m > 0 ? `${m}m` : '<1m';
  }

  return { ms, hours, days, display };
}

export function getRoleForState(stateName) {
  return ROLE_MAP[stateName] || '—';
}

export function getStatusBadgeColor(stateName) {
  const colors = {
    concepto: 'badge-purple',
    diseno: 'badge-blue',
    costeo: 'badge-amber',
    industrializacion: 'badge-red',
    produccion: 'badge-green',
    comercial: 'badge-indigo',
    bordado: 'badge-pink',
    sublimado: 'badge-teal',
    proceso_externo: 'badge-orange',
    union: 'badge-violet',
    pausado: 'badge-gray',
    completado: 'badge-emerald',
    cancelado: 'badge-red',
  };
  return colors[stateName] || 'badge-gray';
}

export async function fetchCollections() {
  if (collectionsCache) return collectionsCache;
  const { data, error } = await getCollections();
  if (error) throw error;
  const visible = restrictPilotCollections(data || []);
  if (PILOT_COLLECTION_CODE === 'SS27' && !visible.some(c => c.code === 'SS27' && c.year === 2027)) {
    throw new Error('Colección SS27/2027 no disponible o no visible; revisar configuración y permisos.');
  }
  collectionsCache = visible;
  return collectionsCache;
}

export function clearCollectionsCache() {
  collectionsCache = null;
}

export async function loadAlertSource() {
  let states;
  if (PILOT_COLLECTION_CODE === 'SS27') {
    const collections = await fetchCollections();
    const pilotCollection = collections.find(c => c.code === 'SS27' && c.year === 2027);
    if (!pilotCollection) throw new Error('Colección SS27/2027 no disponible o no visible.');
    const result = await getPilotStates(pilotCollection.id);
    if (result.error) throw result.error;
    states = result.data.filter(state => state.collection_id === pilotCollection.id
      && state.references?.year === 2027);
  } else {
    const result = await getAllStates();
    if (result.error) throw result.error;
    states = result.data;
  }
  if (!states?.length) return { states: [], refs: [] };
  const { data: refs, error } = await getReferencesByIds(states.map(state => state.reference_id));
  if (error) throw error;
  const collectionByReference = new Map(states.map(state => [state.reference_id, state.collection_id]));
  const scopedRefs = PILOT_COLLECTION_CODE === 'SS27'
    ? refs.filter(ref => ref.year === 2027 && collectionByReference.get(ref.id) === ref.collection_id) : refs;
  const allowed = new Set(scopedRefs.map(ref => ref.id));
  return { states: states.filter(state => allowed.has(state.reference_id)), refs: scopedRefs };
}

export async function getInbox(filters = {}) {
  const collections = await fetchCollections();
  const pilotCollection = PILOT_COLLECTION_CODE === 'SS27'
    ? collections.find(c => c.code === 'SS27' && c.year === 2027) : null;
  if (PILOT_COLLECTION_CODE === 'SS27' && !pilotCollection) throw new Error('Colección SS27/2027 no disponible o no visible.');
  const { data: states, error: statesError } = PILOT_COLLECTION_CODE === 'SS27'
    ? await getPilotStates(pilotCollection.id) : await getAllStates();
  if (statesError) throw statesError;
  if (!states?.length) return [];

  const refIds = states.map(s => s.reference_id);
  const { data: refs, error: refsError } = await getReferencesByIds(refIds);
  if (refsError) throw refsError;
  const refMap = {};
  (refs || []).forEach(r => { refMap[r.id] = r; });

  const colMap = {};
  collections.forEach(c => { colMap[c.id] = c; });

  let items = states.filter(state => !PILOT_COLLECTION_CODE ||
    (colMap[state.collection_id]?.code === 'SS27' && refMap[state.reference_id]?.year === 2027)
  ).map(state => {
    const ref = refMap[state.reference_id] || {};
    const col = colMap[state.collection_id] || {};
    const quietTime = calculateQuietTime(state.timestamp_entry);
    const role = state.assigned_role || getRoleForState(state.current_state);

    return {
      referenceId: state.reference_id,
      collectionId: state.collection_id,
      collectionName: col.name || '—',
      collectionYear: col.year || null,
      referenceNumber: ref.reference_number || `#${state.reference_id}`,
      referenceName: ref.name || '',
      codigoMD: ref.reference_codes?.find(code => code.active && code.code_type === 'MD')?.code || null,
      codigoPT: ref.reference_codes?.find(code => code.active && code.code_type === 'PT')?.code || null,
      currentState: state.current_state,
      stateLabel: STATE_LABELS[state.current_state] || state.current_state,
      alertLevel: state.alert_level || 'none',
      alertReason: state.alert_reason,
      consumptionDiff: state.consumption_diff,
      threshold: state.threshold_cm,
      assignedRole: role,
      quietTime,
      timestampEntry: state.timestamp_entry,
      lifecycleStatus: state.lifecycle_status,
      subStates: state.sub_states || [],
      completedSubStates: state.completed_sub_states || [],
      waitingForMerge: state.waiting_for_merge,
    };
  });

  if (filters.state && filters.state !== 'all') {
    items = items.filter(i => i.currentState === filters.state);
  }
  if (filters.alertLevel && filters.alertLevel !== 'all') {
    items = items.filter(i => i.alertLevel === filters.alertLevel);
  }
  if (filters.assignedRole) {
    items = items.filter(i =>
      i.assignedRole.toLowerCase().includes(filters.assignedRole.toLowerCase())
    );
  }
  if (filters.minQuietHours > 0) {
    items = items.filter(i => i.quietTime.hours >= filters.minQuietHours);
  }
  if (filters.lifecycleStatus && filters.lifecycleStatus !== 'all') {
    items = items.filter(i => i.lifecycleStatus === filters.lifecycleStatus);
  }
  if (filters.collectionId && filters.collectionId !== 'all') {
    const colId = Number(filters.collectionId);
    items = items.filter(i => i.collectionId === colId);
  }
  if (filters.year && filters.year !== 'all') {
    const yr = Number(filters.year);
    items = items.filter(i => i.collectionYear === yr);
  }

  items.sort((a, b) => {
    const criticalOrder = { critical: 0, warning: 1, none: 2 };
    const aOrder = criticalOrder[a.alertLevel] ?? 2;
    const bOrder = criticalOrder[b.alertLevel] ?? 2;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.quietTime.ms - a.quietTime.ms;
  });

  return items;
}
