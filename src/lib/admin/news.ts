import { supabaseDataRequest } from "@/lib/supabase/auth";
import { optionalText, optionalUuid, requiredText } from "@/lib/admin/staff";
import {
  isAllowedNewsPhoto,
  NEWS_CATEGORIES,
  NEWS_IMAGE_KEYS,
  NEWS_STATUS_LABELS,
  slugify,
  type AdminNewsPost,
  type AdminNewsStatus,
} from "@/com/admin/news/adminNewsData";

const NEWS_SELECT =
  "id,slug,title,category,author_name,excerpt,content,image_key,photo_url,media_asset_id,featured,status,published_at,created_at,updated_at";

type NewsRow = {
  id: number;
  slug: string;
  title: string;
  category: AdminNewsPost["category"];
  author_name: string;
  excerpt: string;
  content: string[] | null;
  image_key: AdminNewsPost["imageKey"];
  photo_url: string;
  media_asset_id: string | null;
  featured: boolean;
  status: AdminNewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapPost(row: NewsRow): AdminNewsPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    authorName: row.author_name,
    excerpt: row.excerpt,
    content: row.content ?? [],
    imageKey: row.image_key,
    photoUrl: row.photo_url,
    mediaAssetId: row.media_asset_id,
    featured: row.featured,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** RLS: ban mục vụ thấy cả bản nháp và bài lưu trữ. */
export async function getAdminNewsPosts(accessToken: string) {
  const rows = await supabaseDataRequest<NewsRow[]>(
    `news_posts?select=${NEWS_SELECT}&order=created_at.desc&limit=1000`,
    accessToken,
  );
  return rows.map(mapPost);
}

export function isNewsStatus(value: unknown): value is AdminNewsStatus {
  return typeof value === "string" && value in NEWS_STATUS_LABELS;
}

export function parseNewsInput(body: Record<string, unknown>) {
  const title = requiredText(body.title, 200, "Tiêu đề");
  const slug = slugify(typeof body.slug === "string" && body.slug.trim() ? body.slug : title);
  if (!slug) throw new Error("Đường dẫn bài viết không hợp lệ.");
  if (!NEWS_CATEGORIES.includes(body.category as AdminNewsPost["category"])) {
    throw new Error("Chuyên mục không hợp lệ.");
  }
  if (!NEWS_IMAGE_KEYS.some((item) => item.value === body.imageKey)) {
    throw new Error("Hình minh hoạ không hợp lệ.");
  }
  if (!isNewsStatus(body.status)) throw new Error("Trạng thái không hợp lệ.");

  const content = Array.isArray(body.content)
    ? body.content.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
  if (content.length > 100 || content.some((item) => item.length > 5000)) {
    throw new Error("Nội dung quá dài.");
  }

  const photoUrl = optionalText(body.photoUrl, 2000, "Ảnh bìa") ?? "";
  if (photoUrl && !isAllowedNewsPhoto(photoUrl)) {
    throw new Error("Ảnh bìa cần được tải lên, hoặc lấy từ images.unsplash.com.");
  }
  if (body.status === "published" && !photoUrl) {
    throw new Error("Bài đăng công khai cần có ảnh bìa.");
  }

  let publishedAt: string | null = null;
  if (typeof body.publishedAt === "string" && body.publishedAt) {
    const date = new Date(body.publishedAt);
    if (Number.isNaN(date.getTime())) throw new Error("Ngày đăng không hợp lệ.");
    publishedAt = date.toISOString();
  }

  return {
    title,
    slug,
    category: body.category as string,
    author_name: optionalText(body.authorName, 120, "Tác giả") ?? "Ban Truyền Thông",
    excerpt: requiredText(body.excerpt, 600, "Tóm tắt"),
    content,
    image_key: body.imageKey as string,
    photo_url: photoUrl,
    media_asset_id: optionalUuid(body.mediaAssetId),
    featured: body.featured === true,
    status: body.status,
    // Đăng lần đầu mà chưa chọn ngày thì lấy thời điểm hiện tại.
    published_at: publishedAt ?? (body.status === "published" ? new Date().toISOString() : null),
  };
}

function friendlyError(error: unknown) {
  if (error instanceof Error && /duplicate key|news_posts_slug_key/i.test(error.message)) {
    return new Error("Đường dẫn bài viết đã tồn tại, vui lòng đổi đường dẫn khác.");
  }
  return error;
}

export async function createAdminNewsPost(
  accessToken: string,
  userId: string,
  input: ReturnType<typeof parseNewsInput>,
) {
  try {
    const rows = await supabaseDataRequest<NewsRow[]>(`news_posts?select=${NEWS_SELECT}`, accessToken, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...input, created_by: userId }),
    });
    return mapPost(rows[0]);
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function getNewsPostState(accessToken: string, id: string) {
  const rows = await supabaseDataRequest<Array<{ published_at: string | null; media_asset_id: string | null; photo_url: string }>>(
    `news_posts?id=eq.${id}&select=published_at,media_asset_id,photo_url`,
    accessToken,
  );
  return rows[0] ?? null;
}

export async function updateAdminNewsPost(accessToken: string, id: string, patch: Record<string, unknown>) {
  try {
    const rows = await supabaseDataRequest<NewsRow[]>(
      `news_posts?id=eq.${id}&select=${NEWS_SELECT}`,
      accessToken,
      { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) },
    );
    return rows[0] ? mapPost(rows[0]) : null;
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function deleteAdminNewsPost(accessToken: string, id: string) {
  const rows = await supabaseDataRequest<Array<{ id: number; title: string; media_asset_id: string | null }>>(
    `news_posts?id=eq.${id}&select=id,title,media_asset_id`,
    accessToken,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return rows[0] ?? null;
}
