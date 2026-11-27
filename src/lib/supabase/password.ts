import { NextResponse } from "next/server";
import {
  setAuthCookies,
  supabaseAuthRequest,
  type SupabaseAuthUser,
} from "@/lib/supabase/auth";

type LoginSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: SupabaseAuthUser;
};

type PasswordBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Xác thực lại bằng mật khẩu hiện tại rồi đặt mật khẩu mới cho tài khoản đang đăng nhập.
 * Dùng chung cho trang hồ sơ thành viên và trang hồ sơ admin.
 */
export async function changePasswordResponse({
  userId,
  email,
  body,
  successMessage,
}: {
  userId: string;
  email: string;
  body: PasswordBody;
  successMessage: string;
}) {
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return fail("Vui lòng nhập đầy đủ thông tin mật khẩu.");
  }
  if (newPassword.length < 8) return fail("Mật khẩu mới phải có ít nhất 8 ký tự.");
  if (newPassword !== confirmPassword) return fail("Mật khẩu xác nhận chưa khớp.");
  if (currentPassword === newPassword) {
    return fail("Mật khẩu mới cần khác mật khẩu hiện tại.");
  }
  if (!email) return fail("Không tìm thấy email tài khoản để xác thực.");

  let session: LoginSession;
  try {
    session = await supabaseAuthRequest<LoginSession>("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password: currentPassword }),
    });
  } catch {
    return fail("Mật khẩu hiện tại không đúng.");
  }

  if (session.user.id !== userId) {
    return fail("Thông tin xác thực không thuộc tài khoản hiện tại.", 403);
  }

  await supabaseAuthRequest("/user", {
    method: "PUT",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ password: newPassword }),
  });

  const response = NextResponse.json({ message: successMessage });
  setAuthCookies(response, session);
  return response;
}
