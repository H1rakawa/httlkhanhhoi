import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/supabase/auth";
import { changePasswordResponse } from "@/lib/supabase/password";
import { getUserDisplayEmail } from "@/lib/supabase/user-display";

export async function POST(request: Request) {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để đổi mật khẩu." },
        { status: 401 },
      );
    }

    if (!account.user.app_metadata?.providers?.includes("email")) {
      return NextResponse.json(
        { error: "Tài khoản đăng nhập bằng Google/Facebook không dùng mật khẩu." },
        { status: 400 },
      );
    }

    return await changePasswordResponse({
      userId: account.user.id,
      email: getUserDisplayEmail(account.user, account.profile),
      body: await request.json(),
      successMessage: "Mật khẩu tài khoản đã được cập nhật.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể đổi mật khẩu lúc này.",
      },
      { status: 400 },
    );
  }
}
