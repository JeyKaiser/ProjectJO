import { getThresholdConfigs, client } from '../lib/supabase';

const DEFAULT_THRESHOLD = 45;

export async function getThreshold(referenceId) {
  let collectionId = null;
  const { data: state } = await client
    .from('reference_states')
    .select('collection_id')
    .eq('reference_id', referenceId)
    .maybeSingle();
  if (state) collectionId = state.collection_id;

  const { data: configs } = await getThresholdConfigs();
  if (!configs?.length) return DEFAULT_THRESHOLD;

  const refOverride = configs.find(c => c.reference_id === referenceId);
  if (refOverride) return Number(refOverride.threshold_cm);

  const colOverride = configs.find(
    c => c.collection_id === collectionId && c.reference_id === null
  );
  if (colOverride) return Number(colOverride.threshold_cm);

  const globalConfig = configs.find(
    c => c.collection_id === null && c.reference_id === null
  );
  return globalConfig ? Number(globalConfig.threshold_cm) : DEFAULT_THRESHOLD;
}

export function getDefaultThreshold() {
  return DEFAULT_THRESHOLD;
}
