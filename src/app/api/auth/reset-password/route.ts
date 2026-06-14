import { NextResponse } from "next/server";
import { supabaseAuthRequest } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  try {
    const { accessToken, password } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Liên kết khôi phục không hợp lệ hoặc đã hết hạn." },
        { status: 401 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 8 ký tự." },
        { status: 400 },
      );
    }

    await supabaseAuthRequest("/user", {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ password }),
    });

    return NextResponse.json({
      message: "Mật khẩu của bạn đã được cập nhật thành công.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật mật khẩu.",
      },
      { status: 400 },
    );
  }
}
