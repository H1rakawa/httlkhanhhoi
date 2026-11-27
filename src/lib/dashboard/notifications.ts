import { supabaseDataRequest } from "@/lib/supabase/auth";

export type MemberNotification = {
  id: string;
  title: string;
  content: string;
  type: "assignment" | "prayer" | "event" | "system";
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationRow = {
  id: number;
  title: string;
  content: string;
  type: MemberNotification["type"];
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export async function getNotifications(userId: string, accessToken: string, limit = 20) {
  const rows = await supabaseDataRequest<NotificationRow[]>(
    `notifications?user_id=eq.${encodeURIComponent(userId)}&select=id,title,content,type,link,is_read,created_at&order=created_at.desc&limit=${limit}`,
    accessToken,
  );
  return rows.map<MemberNotification>((row) => ({
    id: String(row.id),
    title: row.title,
    content: row.content,
    type: row.type,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
}

/** Số thông báo chưa đọc. */
export async function countUnreadNotifications(userId: string, accessToken: string) {
  const rows = await supabaseDataRequest<Array<{ id: number }>>(
    `notifications?user_id=eq.${encodeURIComponent(userId)}&is_read=eq.false&select=id`,
    accessToken,
  );
  return rows.length;
}
