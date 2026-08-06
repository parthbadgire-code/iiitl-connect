export async function uploadFileToR2(file: File): Promise<string> {
  // 1. Get the pre-signed URL from NestJS backend
  const presignResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/storage/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!presignResponse.ok) {
    const error = await presignResponse.json();
    throw new Error(error.message || 'Failed to get pre-signed URL');
  }

  const { uploadUrl, publicUrl } = await presignResponse.json();

  // 2. Upload the file directly to Cloudflare R2
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to storage');
  }

  // 3. Return the public URL for storing in Postgres
  return publicUrl;
}
