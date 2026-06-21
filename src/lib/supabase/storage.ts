import { getSupabaseConfig } from "@/lib/supabase/config";

export type MediaKind = "image" | "video" | "audio" | "document";

export type MediaBucket = {
  bucket: "church-images" | "church-videos" | "church-audio" | "church-documents";
  kind: MediaKind;
};

export function mediaBucketFromMime(mimeType: string): MediaBucket {
  if (mimeType.startsWith("image/")) return { bucket: "church-images", kind: "image" };
  if (mimeType.startsWith("video/")) return { bucket: "church-videos", kind: "video" };
  if (mimeType.startsWith("audio/")) return { bucket: "church-audio", kind: "audio" };
  return { bucket: "church-documents", kind: "document" };
}

export function sanitizeFileName(name: string) {
  const withoutPath = name.split(/[\\/]/).pop() || "file";
  return withoutPath
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "file";
}

export function publicStorageUrl(bucket: string, objectPath: string) {
  const { url } = getSupabaseConfig();
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
}

export async function uploadToStorage({
  accessToken,
  bucket,
  objectPath,
  file,
}: {
  accessToken: string;
  bucket: string;
  objectPath: string;
  file: File;
}) {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/storage/v1/object/${bucket}/${encodeURI(objectPath)}`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": file.type || "application/octet-stream",
        "Cache-Control": "3600",
        "x-upsert": "false",
      },
      body: file,
    },
  );

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || data.error || "Không thể tải file lên Storage.");
  }

  return data;
}
