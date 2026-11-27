import { ROLE_LABELS, type MemberRole } from "@/lib/roles";

export type { MemberRole };
export type MemberStatus = "active" | "inactive" | "blocked";

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  selected?: boolean;
  avatar: string | null;
};

export type AdminMemberApiProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
};

export type AdminMembersResponse = {
  members: AdminMemberApiProfile[];
  page: number;
  pageSize: number;
  total: number;
};

export const roleLabels = ROLE_LABELS;

export function formatMemberDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function mapProfileToAdminMember(
  profile: AdminMemberApiProfile,
): AdminMember {
  return {
    id: profile.id,
    name: profile.name || profile.email,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    status: profile.status ?? "active",
    joinedAt: formatMemberDate(profile.created_at),
    avatar: profile.avatar_url,
  };
}
