export type LibraryResourceType = "PDF" | "Video" | "Sách" | "Bài giảng" | "Âm thanh";

export type LibraryResource = {
  id: string;
  title: string;
  description: string;
  type: LibraryResourceType;
  /** Link mở / tải tài liệu; rỗng khi tài liệu chưa có file. */
  url: string;
  /** Ảnh bìa; rỗng thì hiển thị hình minh hoạ theo loại. */
  image: string;
  createdAt: string;
  updatedAt?: string;
  category?: string | null;
  mimeType?: string | null;
  sizeLabel?: string | null;
  embedUrl?: string;
  source?: "supabase" | "youtube";
  videoId?: string;
};

export const libraryTypes = [
  "Tất cả",
  "PDF",
  "Video",
  "Sách",
  "Bài giảng",
  "Âm thanh",
] as const;

/** Danh mục kỹ thuật (slug) → nhãn hiển thị. */
const categoryLabels: Record<string, string> = {
  "truyen-giang": "Truyền giảng",
};

export function categoryLabel(category?: string | null) {
  if (!category) return null;
  return categoryLabels[category] ?? category;
}

export function normalizeResourceType(type: string, mimeType?: string | null): LibraryResourceType {
  const normalized = `${type} ${mimeType ?? ""}`.trim().toLowerCase();
  if (normalized.includes("video")) return "Video";
  if (normalized.includes("audio") || normalized.includes("âm")) return "Âm thanh";
  if (normalized.includes("book") || normalized.includes("sách")) return "Sách";
  if (normalized.includes("sermon") || normalized.includes("bài giảng")) {
    return "Bài giảng";
  }
  return "PDF";
}

export function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 || value >= 100 ? 0 : 1)} ${units[index]}`;
}

/** Link YouTube (watch / youtu.be / shorts) → link nhúng. */
export function youtubeEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

/** Cách xem trực tiếp tài liệu trên trang: YouTube, video, âm thanh, PDF hoặc không xem được. */
export function previewKind(resource: LibraryResource) {
  if (resource.embedUrl) return "embed" as const;
  if (!resource.url) return null;
  const mime = resource.mimeType?.toLowerCase() ?? "";
  const path = resource.url.split("?")[0].toLowerCase();
  if (mime.startsWith("video/") || /\.(mp4|webm|mov)$/.test(path)) return "video" as const;
  if (mime.startsWith("audio/") || /\.(mp3|m4a|wav|ogg|aac)$/.test(path)) return "audio" as const;
  if (mime === "application/pdf" || path.endsWith(".pdf")) return "pdf" as const;
  return null;
}
