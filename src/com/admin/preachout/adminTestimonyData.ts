export type AdminTestimonyStatus = "pending" | "approved" | "rejected";

export type AdminTestimony = {
  id: number;
  userId: string | null;
  eventId: number | null;
  eventTitle: string | null;
  name: string;
  role: string | null;
  quote: string;
  imageUrl: string | null;
  status: AdminTestimonyStatus;
  approverName: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export const TESTIMONY_STATUS_LABELS: Record<AdminTestimonyStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const testimonyStatusClassName: Record<AdminTestimonyStatus, string> = {
  pending: "bg-[#fff7e6] text-[#8a6110]",
  approved: "bg-[#e7f6ec] text-[#1b7a3d]",
  rejected: "bg-[#fff1f0] text-[#b42318]",
};

export function isTestimonyStatus(value: unknown): value is AdminTestimonyStatus {
  return typeof value === "string" && value in TESTIMONY_STATUS_LABELS;
}
