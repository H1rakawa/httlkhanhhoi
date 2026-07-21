import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  supabaseAuthRequest,
  type SupabaseAuthUser,
} from "@/lib/supabase/auth";
import {
  getSupabaseConfig,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/config";

function createSupabaseAdminClient() {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const accessToken = request.headers
    .get("cookie")
    ?.split("; ")
    .find((cookie) => cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (accessToken) {
    const user = await supabaseAuthRequest<SupabaseAuthUser>("/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null);

    if (user?.id) {
      await createSupabaseAdminClient()
        .from("profiles")
        .update({
          is_online: false,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .then(() => undefined);
    }

    await supabaseAuthRequest("/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
