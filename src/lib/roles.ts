/**
 * Vai trò tài khoản (khớp enum public.user_role). Dùng được ở cả server và client.
 * Ban mục vụ (vào trang quản trị) = STAFF_ROLES, trùng RLS public.is_staff();
 * quản lý thành viên chỉ dành cho admin (private.is_admin()).
 */
export const MEMBER_ROLES = ["admin", "pastor", "staff", "deacon", "member"] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: "Quản trị viên",
  pastor: "Quản nhiệm",
  staff: "Nhân sự",
  deacon: "Chấp sự",
  member: "Tín hữu",
};

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  admin: "Toàn quyền, gồm quản lý thành viên",
  pastor: "Vào trang quản trị, trừ quản lý thành viên",
  staff: "Vào trang quản trị, trừ quản lý thành viên",
  deacon: "Khu vực thành viên",
  member: "Khu vực thành viên",
};

export const STAFF_ROLES: readonly MemberRole[] = ["admin", "pastor", "staff"];

export function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && (MEMBER_ROLES as readonly string[]).includes(value);
}

export function isStaffRole(value: unknown) {
  return isMemberRole(value) && STAFF_ROLES.includes(value);
}

export function roleLabel(value: string | null | undefined) {
  return isMemberRole(value) ? ROLE_LABELS[value] : ROLE_LABELS.member;
}
