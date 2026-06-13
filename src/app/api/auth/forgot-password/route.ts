import { NextResponse } from "next/server";
import { supabaseAuthRequest } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email." },
        { status: 400 },
      );
    }

    await supabaseAuthRequest("/recover", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return NextResponse.json({
      message: "Liên kết khôi phục đã được gửi đến email của bạn.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể gửi liên kết khôi phục.",
      },
      { status: 400 },
    );
  }
}
