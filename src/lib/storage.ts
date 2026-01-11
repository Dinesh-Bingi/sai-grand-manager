import { supabase } from '@/integrations/supabase/client';

export async function uploadIdProofImage(
  file: File,
  bookingId: string,
  guestId: string,
  imageType: 'front' | 'back'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${bookingId}/${guestId}/${imageType}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('id-proofs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return data.path;
}

export async function getIdProofImageUrl(path: string): Promise<string | null> {
  if (!path) return null;
  
  const { data, error } = await supabase.storage
    .from('id-proofs')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

export async function deleteIdProofImages(bookingId: string): Promise<void> {
  const { data, error } = await supabase.storage
    .from('id-proofs')
    .list(bookingId);

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  if (data && data.length > 0) {
    const filesToDelete = data.map((file) => `${bookingId}/${file.name}`);
    await supabase.storage.from('id-proofs').remove(filesToDelete);
  }
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}
