import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'jo' },
});

export const STORAGE_BUCKET = 'colecciones';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

export async function uploadImage(file, folder = 'referencias') {
  const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (error) throw error;
  return getImageUrl(data.path);
}

export async function getCollections() {
  const { data, error } = await client
    .from('collections')
    .select('id, name, code')
    .eq('active', true)
    .order('name');
  return { data: data || [], error };
}

export default supabase;
