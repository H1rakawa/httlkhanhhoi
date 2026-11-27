import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  type SupabaseAuthUser,
} from "@/lib/supabase/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";

type RefreshSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: SupabaseAuthUser;
};

/** Làm mới sớm 2 phút trước khi access token hết hạn. */
const REFRESH_MARGIN_SECONDS = 120;

/**
 * Đọc thời điểm hết hạn trong JWT (không xác thực chữ ký: chỉ để biết khi nào cần
 * làm mới; quyền thật vẫn do Supabase kiểm tra ở mỗi request).
 */
export function tokenExpiresAt(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return 0;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof json.exp === "number" ? json.exp : 0;
  } catch {
    return 0;
  }
}

/**
 * Giữ phiên đăng nhập: access token của Supabase chỉ sống 1 giờ. Khi nó sắp hết
 * (hoặc cookie đã hết hạn) mà vẫn còn refresh token, proxy đổi lấy cặp token mới,
 * gắn vào request hiện tại để trang render ở server thấy ngay, và ghi cookie mới
 * cho trình duyệt.
 */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return NextResponse.next();

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const now = Math.floor(Date.now() / 1000);
  if (accessToken && tokenExpiresAt(accessToken) - now > REFRESH_MARGIN_SECONDS) {
    return NextResponse.next();
  }

  let result: Response;
  try {
    const { url, publishableKey } = getSupabaseConfig();
    result = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
  } catch {
    // Mất kết nối tạm thời: giữ nguyên cookie, request sau sẽ thử lại.
    return NextResponse.next();
  }

  if (result.ok) {
    const session = (await result.json()) as RefreshSession;
    request.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token);
    request.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token);
    const response = NextResponse.next({ request: { headers: request.headers } });
    setAuthCookies(response, session);
    return response;
  }

  if (result.status >= 500) return NextResponse.next();

  // Refresh token hết hạn hoặc đã bị thu hồi: xoá phiên để trang coi như đăng xuất.
  request.cookies.delete(ACCESS_TOKEN_COOKIE);
  request.cookies.delete(REFRESH_TOKEN_COOKIE);
  const response = NextResponse.next({ request: { headers: request.headers } });
  clearAuthCookies(response);
  return response;
}

export const config = {
  matcher: [
    // Bỏ qua file tĩnh, ảnh tối ưu và các route đăng nhập / đăng xuất (tự quản lý cookie).
    "/((?!_next/static|_next/image|api/auth|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|mp3|pdf|woff2?)$).*)",
  ],
};
