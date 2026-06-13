import { NextResponse } from "next/server";
import { setAuthCookies, supabaseAuthRequest } from "@/lib/supabase/auth";

type LoginSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: {
    id: string;
    email?: string;
  };
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập email và mật khẩu." },
        { status: 400 },
      );
    }

    const data = await supabaseAuthRequest<LoginSession>(
      "/token?grant_type=password",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    const response = NextResponse.json({ user: data.user });
    setAuthCookies(response, data);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Email hoặc mật khẩu không chính xác.",
      },
      { status: 401 },
    );
  }
}
