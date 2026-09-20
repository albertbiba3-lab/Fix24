import { supabase } from '../supabaseClient';
import { validatePhotos } from './utils';
export async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export async function uploadPhoto(file, bucket, folder) {
  const invalid = validatePhotos([file]);
  if (invalid) throw new Error(`FIX24: ${invalid}`);
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  await result(supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false }));
  return path;
}
export async function attachRequestPhotos(requestId, files) {
  let failed = 0;
  for (const file of files) {
    let path;
    try {
      path = await uploadPhoto(file, 'request-photos', requestId);
      await result(supabase.from('service_request_photos').insert({ request_id: requestId, storage_path: path }));
    } catch {
      failed++;
      if (path) await supabase.storage.from('request-photos').remove([path]);
    }
  }
  return failed;
}
