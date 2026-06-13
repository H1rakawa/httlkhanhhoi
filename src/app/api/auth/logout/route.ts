import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  supabaseAuthRequest,
} from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const accessToken = request.headers
    .get("cookie")
    ?.split("; ")
    .find((cookie) => cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (accessToken) {
    await supabaseAuthRequest("/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
