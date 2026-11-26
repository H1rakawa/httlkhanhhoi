import { NextResponse } from "next/server";
import {
  OAUTH_VERIFIER_COOKIE,
  setAuthCookies,
  supabaseAuthRequest,
  type SupabaseAuthUser,
} from "@/lib/supabase/auth";

type OAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: SupabaseAuthUser;
};

function redirectWithError(origin: string, message: string) {
  const loginUrl = new URL("/auth", origin);
  loginUrl.searchParams.set("error", message);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

function describeProviderError(error: string) {
  const message = error.toLowerCase();

  if (message.includes("denied")) {
    return "Bạn đã hủy đăng nhập hoặc chưa cấp quyền cho ứng dụng.";
  }
  // Facebook accounts registered by phone have no email to share.
  if (message.includes("email")) {
    return "Tài khoản này không cung cấp email. Vui lòng cấp quyền email hoặc dùng phương thức đăng nhập khác.";
  }
  // Supabase could not trade the provider's code for tokens, almost always a
  // wrong client ID/secret in the provider settings. Not fixable by the user.
  if (message.includes("unable to exchange external code")) {
    return "Không thể hoàn tất đăng nhập do lỗi cấu hình máy chủ. Vui lòng thử lại sau hoặc dùng phương thức đăng nhập khác.";
  }

  return error;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { origin, searchParams } = requestUrl;
  const code = searchParams.get("code");
  const providerError =
    searchParams.get("error_description") || searchParams.get("error");

  if (providerError) {
    return redirectWithError(origin, describeProviderError(providerError));
  }
  if (!code) {
    return redirectWithError(origin, "Thiếu mã xác thực đăng nhập.");
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const codeVerifier = cookieHeader
    .split("; ")
    .find((cookie) => cookie.startsWith(`${OAUTH_VERIFIER_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!codeVerifier) {
    return redirectWithError(
      origin,
      "Phiên đăng nhập đã hết hạn. Vui lòng thử lại.",
    );
  }

  try {
    const session = await supabaseAuthRequest<OAuthSession>(
      "/token?grant_type=pkce",
      {
        method: "POST",
        body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
      },
    );

    // The handle_new_user trigger creates the member profile from the provider
    // metadata (full_name, avatar_url) on first sign-in.
    const response = NextResponse.redirect(new URL("/dashboard", origin));
    setAuthCookies(response, session);
    response.cookies.set(OAUTH_VERIFIER_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return redirectWithError(
      origin,
      error instanceof Error ? error.message : "Đăng nhập thất bại.",
    );
  }
}
