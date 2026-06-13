import { NextResponse } from "next/server";
import { setAuthCookies, supabaseAuthRequest } from "@/lib/supabase/auth";

type RegisterSession = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user: {
    id: string;
    email?: string;
  };
};

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, password } = await request.json();

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
        data: { full_name: fullName, phone },
      }),
    });

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
