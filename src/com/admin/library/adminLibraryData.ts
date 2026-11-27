import type { LibraryResourceType } from "@/com/library/libraryData";

export type AdminResource = {
  id: number;
  title: string;
  description: string;
  type: LibraryResourceType;
  category: string | null;
  url: string;
  thumbnailUrl: string | null;
  mediaAssetId: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
  uploaderName: string | null;
};

export const RESOURCE_TYPES: LibraryResourceType[] = ["PDF", "Sách", "Bài giảng", "Video", "Âm thanh"];

/** Danh mục gợi ý (slug lưu trong DB → nhãn). "truyen-giang" hiển thị ở /preachout. */
export const RESOURCE_CATEGORIES = [
  { value: "giao-trinh", label: "Giáo trình" },
  { value: "bai-giang", label: "Bài giảng" },
  { value: "truyen-giang", label: "Truyền giảng" },
  { value: "tai-lieu-hoc", label: "Tài liệu học" },
] as const;

export function resourceCategoryLabel(value: string | null) {
  if (!value) return "Chưa phân loại";
  return RESOURCE_CATEGORIES.find((item) => item.value === value)?.label ?? value;
}

export const resourceTypeClassName: Record<LibraryResourceType, string> = {
  PDF: "bg-[#eef0ff] text-[#6157ff]",
  Sách: "bg-[#eaf3ff] text-[#0058b0]",
  "Bài giảng": "bg-[#fff7e6] text-[#8a6110]",
  Video: "bg-[#fff0f3] text-[#d92d5c]",
  "Âm thanh": "bg-[#fff4e8] text-[#c4501b]",
};

/** Loại tài liệu gợi ý theo file vừa tải lên. */
export function resourceTypeFromMime(mimeType: string): LibraryResourceType {
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Âm thanh";
  if (mimeType.startsWith("image/")) return "Sách";
  return "PDF";
}
