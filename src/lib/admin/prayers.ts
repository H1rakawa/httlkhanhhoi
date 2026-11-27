import { supabaseDataRequest } from "@/lib/supabase/auth";
import type { AdminPrayerItem, AdminPrayerStatus } from "@/com/admin/pray/adminPrayerData";
import type { PrayerPrivacy } from "@/com/pray/prayData";

const ADMIN_PRAYER_SELECT = [
  "id,title,content,category,privacy,is_anonymous,status,image_url,intercession_count",
  "created_at,approved_at,answered_at,user_id",
  "author:user_id(name,email,avatar_url)",
  "approver:approved_by(name,email)",
  "prayer_comments(count)",
].join(",");

type AdminPrayerRow = {
  id: number;
  title: string;
  content: string;
  category: string;
  privacy: PrayerPrivacy;
  is_anonymous: boolean;
  status: AdminPrayerStatus;
  image_url: string | null;
  intercession_count: number;
  created_at: string;
  approved_at: string | null;
  answered_at: string | null;
  user_id: string;
  author: { name: string | null; email: string | null; avatar_url: string | null } | null;
  approver: { name: string | null; email: string | null } | null;
  prayer_comments: Array<{ count: number }> | null;
};

function mapAdminPrayer(row: AdminPrayerRow): AdminPrayerItem {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    privacy: row.privacy,
    isAnonymous: row.is_anonymous,
    status: row.status,
    imageUrl: row.image_url,
    intercessionCount: row.intercession_count ?? 0,
    commentCount: row.prayer_comments?.[0]?.count ?? 0,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    answeredAt: row.answered_at,
    userId: row.user_id,
    senderName: row.author?.name || row.author?.email?.split("@")[0] || "Thành viên",
    senderEmail: row.author?.email ?? null,
    senderAvatar: row.author?.avatar_url ?? null,
    approverName: row.approver?.name || row.approver?.email || null,
  };
}

/** Toàn bộ lời cầu thay cho ban mục vụ (RLS: is_staff thấy cả riêng tư và chờ duyệt). */
export async function getAdminPrayers(accessToken: string) {
  const rows = await supabaseDataRequest<AdminPrayerRow[]>(
    `prayer_requests?select=${ADMIN_PRAYER_SELECT}&order=created_at.desc&limit=1000`,
    accessToken,
  );
  return rows.map(mapAdminPrayer);
}

export async function updateAdminPrayers(
  ids: number[],
  status: AdminPrayerStatus,
  accessToken: string,
) {
  const patch: Record<string, unknown> = { status };
  // Đưa về chờ duyệt / từ chối thì xoá thông tin duyệt cũ.
  if (status === "pending" || status === "rejected") {
    patch.approved_at = null;
    patch.approved_by = null;
    patch.answered_at = null;
  }
  if (status === "approved") patch.answered_at = null;

  const rows = await supabaseDataRequest<AdminPrayerRow[]>(
    `prayer_requests?id=in.(${ids.join(",")})&select=${ADMIN_PRAYER_SELECT}`,
    accessToken,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    },
  );
  return rows.map(mapAdminPrayer);
}

export async function deleteAdminPrayers(ids: number[], accessToken: string) {
  const rows = await supabaseDataRequest<Array<{ id: number }>>(
    `prayer_requests?id=in.(${ids.join(",")})&select=id`,
    accessToken,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return rows.map((row) => row.id);
}

/** Ghi nhật ký cho trang Tổng quan; lỗi ghi log không làm hỏng thao tác chính. */
export async function logAdminActivity(
  accessToken: string,
  actorId: string,
  entries: Array<{ action: string; targetTable: string; targetId: string; metadata?: object }>,
) {
  if (!entries.length) return;
  await supabaseDataRequest("activity_logs", accessToken, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(
      entries.map((entry) => ({
        actor_id: actorId,
        action: entry.action,
        target_table: entry.targetTable,
        target_id: entry.targetId,
        metadata: entry.metadata ?? {},
      })),
    ),
  }).catch(() => undefined);
}
