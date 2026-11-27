import { NextResponse } from "next/server";
import { isStaffProfile } from "@/lib/admin/staff";
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

    if (!isStaffProfile(account.profile)) {
      return NextResponse.json(
        { error: "Bạn không có quyền đổi mật khẩu quản trị." },
        { status: 403 },
      );
    }

    return await changePasswordResponse({
      userId: account.user.id,
      email: getUserDisplayEmail(account.user, account.profile),
      body: await request.json(),
      successMessage: "Mật khẩu quản trị đã được cập nhật.",
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
