import { supabaseDataRequest } from "@/lib/supabase/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  mediaBucketFromMime,
  publicStorageUrl,
  sanitizeFileName,
  type MediaKind,
} from "@/lib/supabase/storage";

/** Giới hạn và kiểu file khớp cấu hình 4 bucket trên Supabase Storage. */
const BUCKET_RULES: Record<string, { maxBytes: number; mimeTypes: string[] }> = {
  "church-images": {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  "church-videos": {
    maxBytes: 500 * 1024 * 1024,
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  "church-audio": {
    maxBytes: 100 * 1024 * 1024,
    mimeTypes: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"],
  },
  "church-documents": {
    maxBytes: 50 * 1024 * 1024,
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

export const MEDIA_RELATED_TABLES = ["resources", "events", "news_posts", "testimonies"] as const;
export type MediaRelatedTable = (typeof MEDIA_RELATED_TABLES)[number];

export type AdminMediaAsset = {
  id: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  kind: MediaKind;
  fileName: string;
};

function formatLimit(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

/** Kiểm tra file rồi tạo đường dẫn upload có chữ ký (trình duyệt tải thẳng lên Storage). */
export async function createSignedUpload({
  accessToken,
  userId,
  fileName,
  mimeType,
  size,
}: {
  accessToken: string;
  userId: string;
  fileName: string;
  mimeType: string;
  size: number;
}) {
  const { bucket, kind } = mediaBucketFromMime(mimeType);
  const rule = BUCKET_RULES[bucket];
  if (!rule.mimeTypes.includes(mimeType)) {
    throw new Error("Định dạng file chưa được hỗ trợ (ảnh, video, âm thanh, PDF hoặc Word).");
  }
  if (!Number.isFinite(size) || size <= 0) throw new Error("File rỗng.");
  if (size > rule.maxBytes) {
    throw new Error(`File quá lớn. Tối đa ${formatLimit(rule.maxBytes)} cho loại file này.`);
  }

  // RLS storage chỉ cho tải vào thư mục của chính mình: <uid>/...
  const objectPath = `${userId}/${kind}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as {
    url?: string;
    message?: string;
    error?: string;
  };
  if (!response.ok || !data.url) {
    throw new Error(data.message || data.error || "Không tạo được đường dẫn tải file.");
  }

  return {
    bucket,
    objectPath,
    uploadUrl: `${url}/storage/v1${data.url}`,
    apikey: publishableKey,
  };
}

/** Sau khi trình duyệt tải xong: xác minh file có thật rồi ghi vào media_assets. */
export async function registerUploadedMedia({
  accessToken,
  userId,
  bucket,
  objectPath,
  fileName,
  relatedTable,
}: {
  accessToken: string;
  userId: string;
  bucket: string;
  objectPath: string;
  fileName: string;
  relatedTable: MediaRelatedTable | null;
}): Promise<AdminMediaAsset> {
  if (!BUCKET_RULES[bucket]) throw new Error("Bucket không hợp lệ.");
  if (!objectPath.startsWith(`${userId}/`) || objectPath.includes("..")) {
    throw new Error("Đường dẫn file không hợp lệ.");
  }

  const publicUrl = publicStorageUrl(bucket, objectPath);
  const head = await fetch(publicUrl, { method: "HEAD", cache: "no-store" });
  if (!head.ok) throw new Error("Không tìm thấy file vừa tải lên. Vui lòng thử lại.");

  const mimeType = head.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
  const sizeBytes = Number(head.headers.get("content-length")) || 0;
  const { kind } = mediaBucketFromMime(mimeType);
  const safeName = sanitizeFileName(fileName);

  const [asset] = await supabaseDataRequest<Array<{ id: string }>>(
    "media_assets?select=id",
    accessToken,
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        bucket_id: bucket,
        object_path: objectPath,
        public_url: publicUrl,
        file_name: safeName,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        media_kind: kind,
        visibility: "public",
        related_table: relatedTable,
        uploaded_by: userId,
      }),
    },
  );

  return { id: asset.id, publicUrl, mimeType, sizeBytes, kind, fileName: safeName };
}

/** Gắn file vào dòng dữ liệu vừa tạo / sửa (để biết file thuộc bài nào). */
export async function linkMediaAsset(
  accessToken: string,
  assetId: string | null | undefined,
  relatedTable: MediaRelatedTable,
  relatedId: string | number,
) {
  if (!assetId) return;
  await supabaseDataRequest(`media_assets?id=eq.${assetId}`, accessToken, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ related_table: relatedTable, related_id: String(relatedId) }),
  }).catch(() => undefined);
}

/** Xoá file khỏi Storage và media_assets (bỏ qua lỗi: dữ liệu chính đã xoá xong). */
export async function removeMediaAsset(accessToken: string, assetId: string | null | undefined) {
  if (!assetId) return;
  try {
    const rows = await supabaseDataRequest<Array<{ bucket_id: string; object_path: string }>>(
      `media_assets?id=eq.${assetId}&select=bucket_id,object_path`,
      accessToken,
      { method: "DELETE", headers: { Prefer: "return=representation" } },
    );
    const row = rows[0];
    if (!row) return;
    const { url, publishableKey } = getSupabaseConfig();
    await fetch(`${url}/storage/v1/object/${row.bucket_id}/${row.object_path}`, {
      method: "DELETE",
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // bỏ qua
  }
}
