import { getAllStates, getReferencesByIds, getCollections } from '../lib/supabase';
import { STATE_LABELS, ROLE_MAP } from '../lib/states';

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
  const { data } = await getCollections();
  collectionsCache = data || [];
  return collectionsCache;
}

export function clearCollectionsCache() {
  collectionsCache = null;
}

export async function getInbox(filters = {}) {
  const { data: states } = await getAllStates();
  if (!states?.length) return [];

  const refIds = states.map(s => s.reference_id);
  const { data: refs } = await getReferencesByIds(refIds);
  const refMap = {};
  (refs || []).forEach(r => { refMap[r.id] = r; });

  const collections = await fetchCollections();
  const colMap = {};
  collections.forEach(c => { colMap[c.id] = c; });

  let items = states.map(state => {
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
      codigoMD: ref.reference_number ? `MD-${String(ref.reference_number).padStart(3, '0')}` : '',
      codigoPT: ref.reference_number ? `PT03${String(ref.reference_number).padStart(3, '0')}` : '',
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
