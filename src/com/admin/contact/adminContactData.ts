export const contactStatuses = ["new", "read", "replied", "archived"] as const;

export type ContactStatus = (typeof contactStatuses)[number];

export type ContactStatusFilter = ContactStatus | "all";

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  repliedAt: string | null;
  handledBy: string | null;
  handlerName: string | null;
};

export type ContactStatusCounts = Record<ContactStatus, number> & {
  all: number;
};

export type ContactListResponse = {
  messages: ContactMessage[];
  counts: ContactStatusCounts;
  page: number;
  pageSize: number;
  total: number;
};

export const contactStatusLabel: Record<ContactStatus, string> = {
  new: "Mới",
  read: "Đã đọc",
  replied: "Đã phản hồi",
  archived: "Lưu trữ",
};

export const contactStatusClassName: Record<ContactStatus, string> = {
  new: "bg-[#fff2c9] text-[#8a6110]",
  read: "bg-[#e2ebff] text-[#48669f]",
  replied: "bg-[#e8f8ee] text-[#2d8f58]",
  archived: "bg-white/82 text-[#667085]",
};

export const contactStatusFilters: Array<{
  value: ContactStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: contactStatusLabel.new },
  { value: "read", label: contactStatusLabel.read },
  { value: "replied", label: contactStatusLabel.replied },
  { value: "archived", label: contactStatusLabel.archived },
];

export function isContactStatus(value: unknown): value is ContactStatus {
  return (
    typeof value === "string" &&
    (contactStatuses as readonly string[]).includes(value)
  );
}

export function emptyContactCounts(): ContactStatusCounts {
  return { all: 0, new: 0, read: 0, replied: 0, archived: 0 };
}
