import { describe, expect, it } from "vitest";
import { isAdminProfile, isStaffProfile } from "@/lib/admin/staff";
import { isMemberRole, isStaffRole, MEMBER_ROLES, roleLabel } from "@/lib/roles";

describe("vai trò", () => {
  it("có đủ 5 vai trò với nhãn tiếng Việt", () => {
    expect(MEMBER_ROLES.map(roleLabel)).toEqual(["Quản trị viên", "Quản nhiệm", "Nhân sự", "Chấp sự", "Tín hữu"]);
    expect(isMemberRole("teacher")).toBe(false);
    expect(roleLabel("unknown")).toBe("Tín hữu");
  });

  it("ban mục vụ gồm quản trị viên, quản nhiệm, nhân sự (khớp public.is_staff)", () => {
    expect(MEMBER_ROLES.filter(isStaffRole)).toEqual(["admin", "pastor", "staff"]);
  });

  it("chỉ tài khoản đang hoạt động mới có quyền", () => {
    expect(isStaffProfile({ role: "pastor", status: "active" })).toBe(true);
    expect(isStaffProfile({ role: "staff", status: "blocked" })).toBe(false);
    expect(isStaffProfile({ role: "deacon", status: "active" })).toBe(false);
    expect(isAdminProfile({ role: "pastor", status: "active" })).toBe(false);
    expect(isAdminProfile({ role: "admin", status: "active" })).toBe(true);
  });
});
