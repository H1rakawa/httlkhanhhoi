import {
  PRAYER_CATEGORIES,
  type PrayerPrivacy,
  type PrayerStatus,
} from "@/com/pray/prayData";

export type AdminPrayerStatus = PrayerStatus;

export type AdminPrayerItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  privacy: PrayerPrivacy;
  isAnonymous: boolean;
  status: AdminPrayerStatus;
  imageUrl: string | null;
  intercessionCount: number;
  commentCount: number;
  createdAt: string;
  approvedAt: string | null;
  answeredAt: string | null;
  userId: string;
  senderName: string;
  senderEmail: string | null;
  senderAvatar: string | null;
  approverName: string | null;
};

export type AdminPrayerCategoryValue = (typeof PRAYER_CATEGORIES)[number] | "all";
export type AdminPrayerStatusValue = AdminPrayerStatus | "all";
export type AdminPrayerSort = "latest" | "oldest" | "pending" | "intercessions";

export const adminPrayerCategoryOptions: { value: AdminPrayerCategoryValue; label: string }[] = [
  { value: "all", label: "Tất cả danh mục" },
  ...PRAYER_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export const adminPrayerStatusOptions: { value: AdminPrayerStatusValue; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "answered", label: "Đã nhậm lời" },
  { value: "rejected", label: "Từ chối" },
];

export const adminPrayerSortOptions: { value: AdminPrayerSort; label: string }[] = [
  { value: "latest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "pending", label: "Ưu tiên chờ duyệt" },
  { value: "intercessions", label: "Nhiều cầu thay nhất" },
];

export const ADMIN_PRAYER_STATUS_LABELS: Record<AdminPrayerStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  answered: "Đã nhậm lời",
  rejected: "Từ chối",
};

export function isAdminPrayerStatus(value: unknown): value is AdminPrayerStatus {
  return value === "pending" || value === "approved" || value === "answered" || value === "rejected";
}

export function formatAdminDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}
