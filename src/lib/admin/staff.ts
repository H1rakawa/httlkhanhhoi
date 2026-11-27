import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { isStaffProfile } from "@/lib/admin/contact";
import { getAccessToken, getCurrentAccount } from "@/lib/supabase/auth";

export { isStaffProfile };

/** Quản trị viên đang hoạt động (trùng private.is_admin()). */
export function isAdminProfile(
  profile: { role?: string | null; status?: string | null } | null | undefined,
) {
  return !!profile && profile.role === "admin" && profile.status === "active";
}

type StaffOptions = {
  /** Chỉ quản trị viên (vd: quản lý thành viên); mặc định cho cả giáo viên. */
  adminOnly?: boolean;
};

function hasAccess(
  profile: { role?: string | null; status?: string | null } | null | undefined,
  options: StaffOptions,
) {
  return options.adminOnly ? isAdminProfile(profile) : isStaffProfile(profile);
}

/**
 * Trang /admin/*: chỉ ban mục vụ (admin hoặc giáo viên đang hoạt động, trùng RLS is_staff()).
 * Tài khoản bị khoá hoặc không đủ quyền được đưa về /dashboard.
 */
export async function requireStaffPage(options: StaffOptions = {}) {
  const account = await getCurrentAccount();
  const accessToken = await getAccessToken();
  if (!account || !accessToken) redirect("/auth");
  if (!hasAccess(account.profile, options)) {
    redirect(isStaffProfile(account.profile) ? "/admin" : "/dashboard");
  }
  return { account, accessToken };
}

/** API /api/admin/*: trả lỗi 401 / 403 thay vì chuyển trang. */
export async function requireStaffApi(
  forbiddenMessage = "Bạn không có quyền thực hiện thao tác này.",
  options: StaffOptions = {},
) {
  const account = await getCurrentAccount();
  const accessToken = await getAccessToken();
  if (!account || !accessToken) {
    return { error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }) };
  }
  if (!hasAccess(account.profile, options)) {
    return { error: NextResponse.json({ error: forbiddenMessage }, { status: 403 }) };
  }
  return { account, accessToken, userId: account.user.id };
}

export function parseRouteId(raw: string) {
  return /^\d{1,18}$/.test(raw) ? raw : null;
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function readJsonBody(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  return body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}

/** Chuỗi đã trim; rỗng → null. Quá dài → lỗi. */
export function optionalText(value: unknown, max: number, label: string) {
  if (value == null) return null;
  if (typeof value !== "string") throw new Error(`${label} không hợp lệ.`);
  const text = value.trim();
  if (text.length > max) throw new Error(`${label} tối đa ${max} ký tự.`);
  return text || null;
}

export function requiredText(value: unknown, max: number, label: string) {
  const text = optionalText(value, max, label);
  if (!text) throw new Error(`Vui lòng nhập ${label.toLowerCase()}.`);
  return text;
}

export function optionalUrl(value: unknown, label: string) {
  const text = optionalText(value, 2000, label);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${label} phải là đường dẫn http(s) hợp lệ.`);
  }
}

export function optionalUuid(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value)) return value;
  throw new Error("Mã file không hợp lệ.");
}

/** Mảng id số nguyên dương (tối đa 200), bỏ trùng. */
export function parseIds(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) return null;
  const ids = value.map(Number);
  return ids.every((id) => Number.isInteger(id) && id > 0) ? [...new Set(ids)] : null;
}
