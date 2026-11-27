export const PRAYER_CATEGORIES = ["Sức khỏe", "Gia đình", "Tâm linh", "Tài chính", "Khác"] as const;
export type PrayerCategory = (typeof PRAYER_CATEGORIES)[number];

export type PrayerPrivacy = "public" | "private";
export type PrayerStatus = "pending" | "approved" | "answered" | "rejected";

export const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đang cầu nguyện",
  answered: "Đã nhận lời",
  rejected: "Không được duyệt",
};

export const PRAYER_PRIVACY_LABELS: Record<PrayerPrivacy, string> = {
  public: "Công khai",
  private: "Riêng tư",
};

export type PrayerRequest = {
  id: string;
  title: string;
  content: string;
  category: string;
  privacy: PrayerPrivacy;
  isAnonymous: boolean;
  status: PrayerStatus;
  imageUrl: string | null;
  intercessionCount: number;
  createdAt: string;
  answeredAt: string | null;
  isMine: boolean;
  hasInterceded: boolean;
  commentCount: number;
  /** null khi lời cầu nguyện ẩn danh và người xem không phải chủ/ban mục vụ. */
  authorName: string | null;
  authorAvatar: string | null;
};

export type PrayerComment = {
  id: string;
  message: string;
  imageUrl: string | null;
  createdAt: string;
  isMine: boolean;
  authorName: string | null;
  authorAvatar: string | null;
};

/** Chỉ cầu thay / động viên được khi lời cầu nguyện đã được duyệt. */
export function isPrayerOpen(request: Pick<PrayerRequest, "status">) {
  return request.status === "approved" || request.status === "answered";
}

export function prayerAuthorLabel(
  request: Pick<PrayerRequest, "authorName" | "isAnonymous" | "isMine">,
) {
  if (request.authorName) {
    return request.isAnonymous && request.isMine
      ? `${request.authorName} (ẩn danh)`
      : request.authorName;
  }
  return request.isAnonymous ? "Ẩn danh" : "Thành viên";
}

export function initials(name: string | null) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  const letters =
    words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : words[0].slice(0, 2);
  return letters.toUpperCase();
}

const relativeFormat = new Intl.RelativeTimeFormat("vi-VN", { numeric: "auto" });
const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function relativeTime(date: string, now = Date.now()) {
  const seconds = Math.round((new Date(date).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "Vừa xong";
  if (abs < 3600) return relativeFormat.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relativeFormat.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86400) return relativeFormat.format(Math.round(seconds / 86400), "day");
  return dateFormat.format(new Date(date));
}
