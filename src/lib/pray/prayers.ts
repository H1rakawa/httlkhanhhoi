import type { PrayerComment, PrayerRequest, PrayerStatus } from "@/com/pray/prayData";
import { getAccessToken, supabaseDataRequest } from "@/lib/supabase/auth";

type PrayerFeedRow = {
  id: number;
  title: string;
  content: string;
  category: string;
  privacy: "public" | "private";
  is_anonymous: boolean;
  status: PrayerStatus;
  image_url: string | null;
  intercession_count: number;
  created_at: string;
  answered_at: string | null;
  is_mine: boolean;
  has_interceded: boolean;
  comment_count: number;
  author_name: string | null;
  author_avatar: string | null;
};

type PrayerCommentRow = {
  id: number;
  message: string;
  image_url: string | null;
  created_at: string;
  is_mine: boolean;
  author_name: string | null;
  author_avatar: string | null;
};

function toPrayer(row: PrayerFeedRow): PrayerRequest {
  return {
    id: String(row.id),
    title: row.title,
    content: row.content,
    category: row.category,
    privacy: row.privacy,
    isAnonymous: row.is_anonymous,
    status: row.status,
    imageUrl: row.image_url,
    intercessionCount: row.intercession_count,
    createdAt: row.created_at,
    answeredAt: row.answered_at,
    isMine: row.is_mine,
    hasInterceded: row.has_interceded,
    commentCount: Number(row.comment_count),
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
  };
}

/**
 * Lời cầu thay người xem được thấy (công khai đã duyệt + của chính mình;
 * ban mục vụ thấy tất cả), mới nhất trước. Tên người gửi ẩn danh đã được che.
 */
export async function getPrayerFeed(limit?: number, accessToken?: string) {
  const rows = await supabaseDataRequest<PrayerFeedRow[]>(
    "rpc/get_prayer_feed",
    accessToken ?? (await getAccessToken()),
    { method: "POST", body: JSON.stringify({ p_limit: limit ?? null }) },
  );
  return rows.map(toPrayer);
}

export async function getPrayerComments(prayerId: number, accessToken?: string) {
  const rows = await supabaseDataRequest<PrayerCommentRow[]>(
    "rpc/get_prayer_comments",
    accessToken ?? (await getAccessToken()),
    { method: "POST", body: JSON.stringify({ p_prayer_id: prayerId }) },
  );
  return rows.map<PrayerComment>((row) => ({
    id: String(row.id),
    message: row.message,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    isMine: row.is_mine,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
  }));
}

export function parsePrayerId(value: string) {
  return /^\d+$/.test(value) ? Number(value) : null;
}
