import type { NewsCategory, NewsPost } from "@/com/news/newsData";

export type AdminNewsStatus = "draft" | "published" | "archived";

export type AdminNewsPost = {
  id: number;
  slug: string;
  title: string;
  category: NewsCategory;
  authorName: string;
  excerpt: string;
  content: string[];
  imageKey: NewsPost["image"];
  photoUrl: string;
  mediaAssetId: string | null;
  featured: boolean;
  status: AdminNewsStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const NEWS_CATEGORIES: NewsCategory[] = ["Tin tức", "Thông báo", "Bài chia sẻ"];

export const NEWS_STATUS_LABELS: Record<AdminNewsStatus, string> = {
  draft: "Bản nháp",
  published: "Đã đăng",
  archived: "Lưu trữ",
};

export const newsStatusClassName: Record<AdminNewsStatus, string> = {
  draft: "bg-[#fff7e6] text-[#8a6110]",
  published: "bg-[#e7f6ec] text-[#1b7a3d]",
  archived: "bg-[#eef0f3] text-[#667085]",
};

/** Biểu tượng minh hoạ (image_key) dùng khi ảnh không tải được. */
export const NEWS_IMAGE_KEYS: Array<{ value: NewsPost["image"]; label: string }> = [
  { value: "church", label: "Nhà thờ" },
  { value: "meeting", label: "Buổi nhóm" },
  { value: "book", label: "Sách / Kinh Thánh" },
  { value: "table", label: "Bàn tiệc / thông công" },
  { value: "retreat", label: "Tĩnh tâm / dã ngoại" },
  { value: "podcast", label: "Podcast / âm thanh" },
];

/** Tiêu đề → đường dẫn không dấu, ví dụ "Lễ Giáng Sinh 2026" → "le-giang-sinh-2026". */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Ảnh bìa tin tức hiển thị qua next/image nên chỉ nhận các domain đã khai báo. */
export const NEWS_PHOTO_HOSTS = ["images.unsplash.com", "sswjiqyyjswopbpawtbc.supabase.co"];

export function isAllowedNewsPhoto(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && NEWS_PHOTO_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}
