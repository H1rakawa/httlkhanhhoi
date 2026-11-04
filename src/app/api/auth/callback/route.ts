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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { origin, searchParams } = requestUrl;
  const code = searchParams.get("code");
  const providerError =
    searchParams.get("error_description") || searchParams.get("error");

  if (providerError) return redirectWithError(origin, providerError);
  if (!code) {
    return redirectWithError(origin, "Thiếu mã xác thực từ Google.");
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
      "Phiên đăng nhập Google đã hết hạn. Vui lòng thử lại.",
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

    // The handle_new_user trigger creates the member profile from the Google
    // metadata (full_name, avatar_url) on first sign-in.
    const response = NextResponse.redirect(new URL("/dashboard", origin));
    setAuthCookies(response, session);
    response.cookies.set(OAUTH_VERIFIER_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return redirectWithError(
      origin,
      error instanceof Error ? error.message : "Đăng nhập Google thất bại.",
    );
  }
}
