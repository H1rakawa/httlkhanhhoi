export const EVENT_CATEGORIES = [
  "Thờ phượng",
  "Đào tạo",
  "Thiện nguyện",
  "Giới trẻ",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventStatus = "preparing" | "open" | "upcoming" | "ended" | "cancelled";

/** Sự kiện đã chuẩn hoá từ bảng public.events, dùng chung cho /calendar và /preachout. */
export type ChurchEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  /** ISO timestamp của giờ bắt đầu. */
  startsAt: string;
  endsAt: string | null;
  type: "regular" | "outreach";
  category: EventCategory;
  capacity: number | null;
  registered: number;
  imageUrl: string | null;
  status: EventStatus;
  schedule: string[];
  registrationOpen: boolean;
  featured: boolean;
};

export type EventViewer = {
  loggedIn: boolean;
  name: string | null;
  email: string | null;
  phone: string | null;
  isStaff: boolean;
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  preparing: "Đang chuẩn bị",
  open: "Đang mở đăng ký",
  upcoming: "Sắp diễn ra",
  ended: "Đã kết thúc",
  cancelled: "Đã huỷ",
};

export const EVENT_TIME_ZONE = "Asia/Ho_Chi_Minh";

/** Sự kiện còn nhận đăng ký không (khớp với trigger guard_event_registration). */
export function canRegister(event: ChurchEvent) {
  if (!event.registrationOpen) return false;
  if (event.status === "ended" || event.status === "cancelled") return false;
  if (event.capacity !== null && event.registered >= event.capacity) return false;
  return true;
}

export function remainingSeats(event: ChurchEvent) {
  return event.capacity === null ? null : Math.max(event.capacity - event.registered, 0);
}

export function formatEventDateTime(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("vi-VN", { timeZone: EVENT_TIME_ZONE, ...options }).format(
    new Date(value),
  );
}

/** "HH:mm - HH:mm" theo giờ Việt Nam. */
export function formatEventTimeRange(event: ChurchEvent) {
  const time = { hour: "2-digit", minute: "2-digit" } as const;
  const start = formatEventDateTime(event.startsAt, time);
  return event.endsAt ? `${start} - ${formatEventDateTime(event.endsAt, time)}` : start;
}

/** "YYYY-MM" theo giờ Việt Nam, để lọc theo tháng. */
export function eventMonthKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(typeof value === "string" ? new Date(value) : value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

/** "YYYY-MM-DD" theo giờ Việt Nam, để đặt sự kiện vào đúng ô ngày. */
export function eventDayKey(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);
}

/** Link "Thêm vào Google Calendar" cho sự kiện. */
export function googleCalendarUrl(event: ChurchEvent) {
  const toStamp = (value: string) =>
    new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end =
    event.endsAt ?? new Date(new Date(event.startsAt).getTime() + 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toStamp(event.startsAt)}/${toStamp(end)}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
