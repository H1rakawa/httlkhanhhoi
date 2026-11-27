import { EVENT_CATEGORIES, EVENT_STATUS_LABELS, type EventCategory, type EventStatus } from "@/lib/events/types";

export type AdminEventType = "regular" | "outreach";

export type AdminEvent = {
  id: number;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  type: AdminEventType;
  category: EventCategory;
  capacity: number | null;
  imageUrl: string | null;
  mediaAssetId: string | null;
  status: EventStatus;
  schedule: string[];
  registrationOpen: boolean;
  featured: boolean;
  /** Tổng số người (attendees) của các đăng ký chưa huỷ. */
  registered: number;
  registrationCount: number;
  createdAt: string;
};

export type AdminRegistrationStatus = "registered" | "attended" | "cancelled";

export type AdminRegistration = {
  id: number;
  eventId: number;
  userId: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  attendees: number;
  status: AdminRegistrationStatus;
  note: string | null;
  createdAt: string;
};

export const EVENT_TYPE_LABELS: Record<AdminEventType, string> = {
  regular: "Sinh hoạt",
  outreach: "Truyền giảng",
};

export const REGISTRATION_STATUS_LABELS: Record<AdminRegistrationStatus, string> = {
  registered: "Đã đăng ký",
  attended: "Đã tham dự",
  cancelled: "Đã huỷ",
};

export const EVENT_STATUSES = Object.keys(EVENT_STATUS_LABELS) as EventStatus[];
export { EVENT_CATEGORIES, EVENT_STATUS_LABELS };

export const eventStatusClassName: Record<EventStatus, string> = {
  preparing: "bg-[#f2f4f7] text-[#475467]",
  open: "bg-[#e7f6ec] text-[#1b7a3d]",
  upcoming: "bg-[#eaf3ff] text-[#0058b0]",
  ended: "bg-[#eef0f3] text-[#667085]",
  cancelled: "bg-[#fff1f0] text-[#b42318]",
};

export const registrationStatusClassName: Record<AdminRegistrationStatus, string> = {
  registered: "bg-[#eaf3ff] text-[#0058b0]",
  attended: "bg-[#e7f6ec] text-[#1b7a3d]",
  cancelled: "bg-[#fff1f0] text-[#b42318]",
};

export function isEventStatus(value: unknown): value is EventStatus {
  return typeof value === "string" && value in EVENT_STATUS_LABELS;
}

export function isEventCategory(value: unknown): value is EventCategory {
  return typeof value === "string" && (EVENT_CATEGORIES as readonly string[]).includes(value);
}

export function isRegistrationStatus(value: unknown): value is AdminRegistrationStatus {
  return typeof value === "string" && value in REGISTRATION_STATUS_LABELS;
}
