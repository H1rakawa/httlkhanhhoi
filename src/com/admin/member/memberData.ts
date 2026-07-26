export type MemberRole = "member" | "teacher" | "admin";

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: MemberRole;
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
  created_at: string;
  updated_at: string;
};

export type AdminMembersResponse = {
  members: AdminMemberApiProfile[];
  page: number;
  pageSize: number;
  total: number;
};

export const roleLabels: Record<MemberRole, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  member: "Thành viên",
};

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
    joinedAt: formatMemberDate(profile.created_at),
    avatar: profile.avatar_url,
  };
}
