import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
  supabaseAuthRequest,
  supabaseDataRequest,
  type SupabaseAuthUser,
} from "@/lib/supabase/auth";

type RefreshSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: SupabaseAuthUser;
};

async function getAccount(accessToken: string) {
  const user = await supabaseAuthRequest<SupabaseAuthUser>("/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profiles = await supabaseDataRequest<
    Array<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      status: string;
    }>
  >(
    `profiles?id=eq.${user.id}&select=id,name,email,phone,avatar_url,role,status`,
    accessToken,
  );

  return { user, profile: profiles[0] ?? null };
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const readCookie = (name: string) =>
    cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=");
  const accessToken = readCookie(ACCESS_TOKEN_COOKIE);
  const refreshToken = readCookie(REFRESH_TOKEN_COOKIE);

  if (accessToken) {
    try {
      return NextResponse.json(await getAccount(accessToken));
    } catch {
      // Refresh below when the access token has expired.
    }
  }

  if (refreshToken) {
    try {
      const session = await supabaseAuthRequest<RefreshSession>(
        "/token?grant_type=refresh_token",
        {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );
      const response = NextResponse.json(await getAccount(session.access_token));
      setAuthCookies(response, session);
      return response;
    } catch {
      // The response below clears an invalid session on the client.
    }
  }

  const response = NextResponse.json(
    { error: "Chưa đăng nhập." },
    { status: 401 },
  );
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
