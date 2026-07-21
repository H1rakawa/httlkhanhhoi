import { NextResponse } from "next/server";
import {
  setAuthCookies,
  supabaseAuthRequest,
  getCurrentAccount,
} from "@/lib/supabase/auth";
import { getUserDisplayEmail } from "@/lib/supabase/user-display";

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
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để đổi mật khẩu." },
        { status: 401 },
      );
    }

    if (account.profile?.role !== "admin" || account.profile.status !== "active") {
      return NextResponse.json(
        { error: "Bạn không có quyền đổi mật khẩu quản trị." },
        { status: 403 },
      );
    }

    const { currentPassword, newPassword, confirmPassword } =
      (await request.json()) as {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      };

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin mật khẩu." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 8 ký tự." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Mật khẩu xác nhận chưa khớp." },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới cần khác mật khẩu hiện tại." },
        { status: 400 },
      );
    }

    const email = getUserDisplayEmail(account.user, account.profile);

    if (!email) {
      return NextResponse.json(
        { error: "Không tìm thấy email tài khoản để xác thực." },
        { status: 400 },
      );
    }

    const session = await supabaseAuthRequest<LoginSession>(
      "/token?grant_type=password",
      {
        method: "POST",
        body: JSON.stringify({ email, password: currentPassword }),
      },
    );

    if (session.user.id !== account.user.id) {
      return NextResponse.json(
        { error: "Thông tin xác thực không thuộc tài khoản hiện tại." },
        { status: 403 },
      );
    }

    await supabaseAuthRequest("/user", {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ password: newPassword }),
    });

    const response = NextResponse.json({
      message: "Mật khẩu quản trị đã được cập nhật.",
    });
    setAuthCookies(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể đổi mật khẩu lúc này.",
      },
      { status: 400 },
    );
  }
}
