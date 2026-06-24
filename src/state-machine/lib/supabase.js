import { supabase as client } from '../../lib/supabase';

const TB = {
  states: 'reference_states',
  history: 'state_history',
  thresholds: 'alert_thresholds',
  references: 'references',
};

export { client };

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

export async function getReference(refId) {
  const { data, error } = await client
    .from(TB.references)
    .select('id, collection_id, reference_number, name, has_embroidery, has_semielaborated')
    .eq('id', refId)
    .maybeSingle();
  return { data, error };
}

export async function getReferencesByIds(ids) {
  if (!ids?.length) return { data: [] };
  const { data, error } = await client
    .from(TB.references)
    .select('id, collection_id, reference_number, name, has_embroidery, has_semielaborated')
    .in('id', ids);
  return { data: data || [], error };
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
    .select('id, collection_id, reference_number, name');
  return { data: data || [], error };
}

export async function getCollections() {
  const { data, error } = await client
    .from('collections')
    .select('id, name, code, year')
    .eq('active', true)
    .order('name');
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
