import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setAuthCookies, supabaseAuthRequest } from "@/lib/supabase/auth";
import {
  getSupabaseUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/config";

type RegisterSession = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user: {
    id: string;
    email?: string;
  };
};

function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };
    const fullName = normalizeText(body.fullName);
    const email = normalizeText(body.email).toLowerCase();
    const phone = normalizeText(body.phone);
    const password = normalizeText(body.password);

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin." },
        { status: 400 },
      );
    }

    const data = await supabaseAuthRequest<RegisterSession>("/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: { full_name: fullName, phone, role: "member" },
      }),
    });

    try {
      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin.from("profiles").upsert(
        {
          id: data.user.id,
          name: fullName,
          email,
          phone,
          role: "member",
          status: "active",
        },
        {
          onConflict: "id",
          ignoreDuplicates: true,
        },
      );
    } catch {
      // Database triggers still create the member profile. This fallback only
      // covers environments where the service-role key is configured.
    }

    const response = NextResponse.json({
      user: data.user,
      requiresEmailConfirmation: !data.access_token,
    });

    if (data.access_token && data.refresh_token) {
      setAuthCookies(response, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user: data.user,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Đăng ký thất bại." },
      { status: 400 },
    );
  }
}
