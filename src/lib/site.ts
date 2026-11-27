/** Thông tin chung của site, dùng cho footer, SEO, sitemap. Đổi qua biến môi trường khi cần. */

const trimSlash = (value: string) => value.replace(/\/$/, "");

export const SITE_NAME = "Hội Thánh Tin Lành Khánh Hội";
export const SITE_SHORT_NAME = "HTTL. Khánh Hội";
export const SITE_DESCRIPTION =
  "Hội Thánh Tin Lành Khánh Hội: lịch nhóm, tin tức, bài giảng, thư viện tài liệu, cầu thay và các hoạt động truyền giảng của cộng đồng.";

export const SITE_URL = trimSlash(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://khanhhoiwebnew.vercel.app",
);

const YOUTUBE_HANDLE = "@httlkhanhhoi4369";

/** Link rỗng thì footer ẩn biểu tượng đó thay vì trỏ về "#". */
export const SOCIAL_LINKS = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || "",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() || `https://www.youtube.com/${YOUTUBE_HANDLE}`,
};
