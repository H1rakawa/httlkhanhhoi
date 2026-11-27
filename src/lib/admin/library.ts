import { supabaseDataRequest } from "@/lib/supabase/auth";
import { normalizeResourceType } from "@/com/library/libraryData";
import { optionalText, optionalUrl, optionalUuid, requiredText } from "@/lib/admin/staff";
import { RESOURCE_TYPES, type AdminResource } from "@/com/admin/library/adminLibraryData";

const RESOURCE_SELECT = [
  "id,title,description,type,category,url,thumbnail_url,media_asset_id,mime_type,size_bytes",
  "is_published,created_at,updated_at",
  "media_asset:media_asset_id(public_url,mime_type,size_bytes)",
  "uploader:uploaded_by(name,email)",
].join(",");

type ResourceRow = {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  category: string | null;
  url: string | null;
  thumbnail_url: string | null;
  media_asset_id: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
  media_asset: { public_url: string | null; mime_type: string | null; size_bytes: number | null } | null;
  uploader: { name: string | null; email: string | null } | null;
};

function mapResource(row: ResourceRow): AdminResource {
  const mimeType = row.mime_type || row.media_asset?.mime_type || null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    type: normalizeResourceType(row.type ?? "", mimeType),
    category: row.category,
    url: row.media_asset?.public_url || row.url || "",
    thumbnailUrl: row.thumbnail_url,
    mediaAssetId: row.media_asset_id,
    mimeType,
    sizeBytes: row.size_bytes ?? row.media_asset?.size_bytes ?? null,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    uploaderName: row.uploader?.name || row.uploader?.email || null,
  };
}

/** RLS: ban mục vụ thấy cả tài liệu chưa xuất bản. */
export async function getAdminResources(accessToken: string) {
  const rows = await supabaseDataRequest<ResourceRow[]>(
    `resources?select=${RESOURCE_SELECT}&order=created_at.desc&limit=1000`,
    accessToken,
  );
  return rows.map(mapResource);
}

export function parseResourceInput(body: Record<string, unknown>) {
  if (!RESOURCE_TYPES.includes(body.type as AdminResource["type"])) {
    throw new Error("Loại tài liệu không hợp lệ.");
  }
  const url = optionalUrl(body.url, "Đường dẫn tài liệu");
  if (!url) throw new Error("Vui lòng tải file lên hoặc dán đường dẫn tài liệu.");

  const category = optionalText(body.category, 60, "Danh mục");
  if (category && !/^[a-z0-9-]+$/.test(category)) {
    throw new Error("Danh mục chỉ gồm chữ thường không dấu, số và dấu gạch ngang (vd: giao-trinh).");
  }
  const size = body.sizeBytes == null || body.sizeBytes === "" ? null : Number(body.sizeBytes);

  return {
    title: requiredText(body.title, 200, "Tên tài liệu"),
    description: optionalText(body.description, 3000, "Mô tả"),
    type: body.type as string,
    category,
    url,
    media_asset_id: optionalUuid(body.mediaAssetId),
    thumbnail_url: optionalUrl(body.thumbnailUrl, "Ảnh bìa"),
    mime_type: optionalText(body.mimeType, 120, "Kiểu file"),
    size_bytes: size !== null && Number.isFinite(size) && size >= 0 ? Math.round(size) : null,
    is_published: body.isPublished !== false,
  };
}

export async function createAdminResource(
  accessToken: string,
  userId: string,
  input: ReturnType<typeof parseResourceInput>,
) {
  const rows = await supabaseDataRequest<ResourceRow[]>(`resources?select=${RESOURCE_SELECT}`, accessToken, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...input, uploaded_by: userId }),
  });
  return mapResource(rows[0]);
}

export async function getResourceMediaAsset(accessToken: string, id: string) {
  const rows = await supabaseDataRequest<Array<{ media_asset_id: string | null }>>(
    `resources?id=eq.${id}&select=media_asset_id`,
    accessToken,
  );
  return rows[0]?.media_asset_id ?? null;
}

export async function updateAdminResource(accessToken: string, id: string, patch: Record<string, unknown>) {
  const rows = await supabaseDataRequest<ResourceRow[]>(
    `resources?id=eq.${id}&select=${RESOURCE_SELECT}`,
    accessToken,
    { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) },
  );
  return rows[0] ? mapResource(rows[0]) : null;
}

export async function deleteAdminResource(accessToken: string, id: string) {
  const rows = await supabaseDataRequest<Array<{ id: number; title: string; media_asset_id: string | null }>>(
    `resources?id=eq.${id}&select=id,title,media_asset_id`,
    accessToken,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return rows[0] ?? null;
}
