import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const ACCESS_TOKEN_COOKIE = "httl-access-token";
export const REFRESH_TOKEN_COOKIE = "httl-refresh-token";

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
};

type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: SupabaseAuthUser;
};

export async function supabaseAuthRequest<T>(
  path: string,
  init: RequestInit = {},
) {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error_description?: string;
    msg?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      data.error_description ||
        data.msg ||
        data.message ||
        "Không thể kết nối đến Supabase.",
    );
  }

  return data;
}

export function setAuthCookies(response: NextResponse, session: AuthSession) {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = session.expires_in ?? 3600;

  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getCurrentUser() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    return await supabaseAuthRequest<SupabaseAuthUser>("/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getCurrentAccount() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accessToken = await getAccessToken();
  try {
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
  } catch {
    return { user, profile: null };
  }
}

export async function supabaseDataRequest<T>(
  tablePath: string,
  accessToken?: string,
  init: RequestInit = {},
) {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${tablePath}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken || publishableKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Không thể đọc dữ liệu từ Supabase.");
  }

  return data;
}
