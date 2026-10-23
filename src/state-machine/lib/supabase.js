import { supabase as client } from '../../lib/supabase';
import { PILOT_COLLECTION_CODE } from '../../lib/pilotScope';

const TB = {
  states: 'reference_states',
  history: 'state_history',
  thresholds: 'alert_thresholds',
  references: 'references',
};

export { client };

// Un intento ambiguo retiene ID/payload/version hasta confirmación. Nunca
// crear una segunda operación de la misma referencia mientras esté pendiente.
const pendingPilotEvents = new Map();

export async function getReferenceState(referenceId) {
  const { data, error } = await client
    .from(TB.states)
    .select('*')
    .eq('reference_id', referenceId)
    .maybeSingle();
  return { data, error };
}

export async function upsertReferenceState(state) {
  const { data, error } = await client
    .from(TB.states)
    .upsert(state, { onConflict: 'reference_id' })
    .select()
    .single();
  return { data, error };
}

export async function insertHistory(entry) {
  const { data, error } = await client
    .from(TB.history)
    .insert(entry)
    .select()
    .single();
  return { data, error };
}

export async function getHistory(refId, limit = 100) {
  const { data, error } = await client
    .from(TB.history)
    .select('*')
    .eq('reference_id', refId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function getAllStates() {
  const { data, error } = await client
    .from(TB.states)
    .select('*')
    .order('last_updated', { ascending: false });
  return { data: data || [], error };
}

// Keyset walk continues until an empty page: server max_rows may be smaller
// than the requested window. Scoped joins prevent out-of-pilot reads before
// pagination, not merely after materializing an unbounded inbox.
export async function getPilotStates(collectionId) {
  if (!Number.isSafeInteger(Number(collectionId)) || Number(collectionId) <= 0) throw new Error('Colección piloto inválida');
  const rows = new Map();
  let cursor = null;
  while (true) {
    let query = client.from(TB.states).select('*,references!inner(id,collection_id,year)')
      .eq('collection_id', Number(collectionId))
      .eq('references.collection_id', Number(collectionId))
      .eq('references.year', 2027).order('id');
    if (cursor !== null) query = query.gt('id', cursor);
    const { data, error } = await query.limit(500);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) rows.set(row.id, row);
    cursor = data[data.length - 1].id;
  }
  return { data: [...rows.values()], error: null };
}

export async function getReference(refId) {
  const { data, error } = await client
    .from(TB.references)
    .select('id, collection_id, year, reference_number, name, has_embroidery, has_semielaborated, collections(code,year)')
    .eq('id', refId)
    .maybeSingle();
  return { data, error };
}

export async function pilotWorkflowEvent(referenceId, event, expectedVersion, payload = {}) {
  let operation = pendingPilotEvents.get(referenceId);
  const fingerprint = JSON.stringify({ event, payload });
  if (operation && operation.fingerprint !== fingerprint) {
    throw new Error('Reintente la operación anterior antes de iniciar otra transición.');
  }
  if (!operation) {
    operation = { requestId: crypto.randomUUID(), fingerprint, event, payload, version: expectedVersion };
    pendingPilotEvents.set(referenceId, operation);
  }
  const invoke = () => client.rpc('pilot_workflow_event_031', {
    p_reference_id: referenceId, p_event: operation.event,
    p_request_id: operation.requestId, p_expected_version: operation.version,
    p_payload: operation.payload,
  });
  const { data, error } = await invoke();
  if (error) {
    // Un SQLSTATE es fallo definitivo; timeout/transporte no confirma commit.
    if (error.code && !String(error.code).startsWith('PGRST')) pendingPilotEvents.delete(referenceId);
    throw error;
  }
  pendingPilotEvents.delete(referenceId);
  return data;
}

export async function getReferencesByIds(ids) {
  if (!ids?.length) return { data: [] };
  const rows = new Map();
  const unique = [...new Set(ids)];
  for (let index = 0; index < unique.length; index += 200) {
    const batch = unique.slice(index, index + 200);
    let cursor = null;
    while (true) {
      let query = client.from(TB.references)
        .select('id, collection_id, year, reference_number, name, has_embroidery, has_semielaborated, reference_codes(code_type,code,active)')
        .in('id', batch).order('id');
      if (cursor !== null) query = query.gt('id', cursor);
      const { data, error } = await query.limit(500);
      if (error) throw error;
      if (!data?.length) break;
      for (const row of data) rows.set(row.id, row);
      cursor = data[data.length - 1].id;
    }
  }
  return { data: [...rows.values()], error: null };
}

export async function getThresholdConfigs() {
  const { data, error } = await client
    .from(TB.thresholds)
    .select('*');
  return { data: data || [], error };
}

export async function getAllReferences() {
  const { data, error } = await client
    .from(TB.references)
    .select('id, collection_id, year, reference_number, name, collections(code,year)');
  return { data: data || [], error };
}

export async function getCollections() {
  let query = client
    .from('collections')
    .select('id, name, code, year')
    .eq('active', true)
    .order('name');
  if (PILOT_COLLECTION_CODE === 'SS27') query = query.eq('code', 'SS27').eq('year', 2027);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function upsertThresholdConfig(config) {
  const { data, error } = await client
    .from(TB.thresholds)
    .upsert(config, { onConflict: 'COALESCE(collection_id,-1),COALESCE(reference_id,-1)' })
    .select()
    .single();
  return { data, error };
}
