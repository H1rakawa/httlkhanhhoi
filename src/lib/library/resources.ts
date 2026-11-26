import {
  formatBytes,
  LibraryResource,
  normalizeResourceType,
  youtubeEmbedUrl,
} from "@/com/library/libraryData";
import { supabaseDataRequest } from "@/lib/supabase/auth";
import { getYouTubeSermons } from "@/lib/youtube/sermons";

type ResourceRow = {
  id: number;
  title: string;
  type: string | null;
  url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string | null;
  media_asset: {
    public_url: string | null;
    media_kind: string | null;
    mime_type: string | null;
    size_bytes: number | null;
  } | null;
};

const RESOURCE_SELECT =
  "id,title,type,url,thumbnail_url,mime_type,size_bytes,description,category,created_at,updated_at,media_asset:media_asset_id(public_url,media_kind,mime_type,size_bytes)";

function toLibraryResource(row: ResourceRow): LibraryResource {
  const mimeType = row.mime_type || row.media_asset?.mime_type || null;
  const url = row.media_asset?.public_url || row.url || "";
  const image =
    row.thumbnail_url ||
    (row.media_asset?.media_kind === "image" ? row.media_asset.public_url : "") ||
    "";

  return {
    id: String(row.id),
    title: row.title,
    description: row.description?.trim() || "",
    type: normalizeResourceType(row.type ?? "", mimeType),
    url,
    image: image ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    category: row.category,
    mimeType,
    sizeLabel: formatBytes(row.size_bytes ?? row.media_asset?.size_bytes),
    embedUrl: (url && youtubeEmbedUrl(url)) || undefined,
    source: "supabase",
  };
}

/** Tài liệu đã xuất bản trong bảng resources, mới nhất trước. */
export async function getPublishedResources(filters: string[] = []) {
  const rows = await supabaseDataRequest<ResourceRow[]>(
    `resources?select=${RESOURCE_SELECT}&is_published=eq.true${filters.map((filter) => `&${filter}`).join("")}&order=created_at.desc`,
  );
  return rows.map(toLibraryResource);
}

export async function getPublishedResource(id: string) {
  if (!/^\d+$/.test(id)) return null;
  const rows = await supabaseDataRequest<ResourceRow[]>(
    `resources?select=${RESOURCE_SELECT}&id=eq.${id}&is_published=eq.true&limit=1`,
  );
  return rows[0] ? toLibraryResource(rows[0]) : null;
}

/** Bài giảng YouTube của kênh Hội Thánh (live + video mới). */
export async function getYouTubeResources() {
  try {
    const feed = await getYouTubeSermons();
    return [feed.live, ...feed.videos];
  } catch {
    return [];
  }
}

/** Tài liệu cho /library: bài giảng YouTube + tài liệu Supabase. */
export async function getLibraryResources() {
  const [youtube, supabase] = await Promise.all([
    getYouTubeResources(),
    getPublishedResources()
      .then((resources) => ({ resources, error: null as string | null }))
      .catch((error: unknown) => ({
        resources: [] as LibraryResource[],
        error: error instanceof Error ? error.message : "Không thể tải tài liệu.",
      })),
  ]);

  return {
    resources: [...youtube, ...supabase.resources],
    error: supabase.error,
  };
}

export async function getLibraryResourceById(id: string) {
  if (id.startsWith("youtube-")) {
    const videos = await getYouTubeResources();
    return videos.find((video) => video.id === id) ?? null;
  }
  try {
    return await getPublishedResource(id);
  } catch {
    return null;
  }
}

/** Tài liệu liên quan: ưu tiên cùng danh mục, rồi cùng loại. */
export async function getRelatedResources(resource: LibraryResource, limit = 3) {
  const pool =
    resource.source === "youtube"
      ? await getYouTubeResources()
      : await getPublishedResources().catch(() => [] as LibraryResource[]);

  const score = (item: LibraryResource) =>
    (resource.category && item.category === resource.category ? 2 : 0) +
    (item.type === resource.type ? 1 : 0);

  return pool
    .filter((item) => item.id !== resource.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
