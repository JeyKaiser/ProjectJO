import supabase from './supabase';

async function callRpc(name, parameters) {
  const { data, error } = await supabase.rpc(name, parameters);
  if (error) throw error;
  return data;
}

export function previewReferenceCsv(document) {
  return callRpc('preview_csv_reference_import', { p_document: document });
}

export function confirmReferenceCsv(document, sourceFile, expectedPreview, confirmationId) {
  if (!confirmationId) throw new Error('confirmation_id es obligatorio');
  return callRpc('confirm_csv_reference_import', {
    p_document: document,
    p_source_file: sourceFile,
    p_expected_preview: expectedPreview,
    p_confirmation_id: confirmationId,
  });
}
