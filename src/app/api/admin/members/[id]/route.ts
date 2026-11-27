import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { badRequest, readJsonBody, requireStaffApi } from "@/lib/admin/staff";
import { logAdminActivity } from "@/lib/admin/prayers";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Khoá lâu dài (~100 năm): Supabase Auth từ chối đăng nhập và làm mới phiên. */
const BLOCK_DURATION = "876000h";

type MemberAction = "block" | "unblock" | "reset-password";

function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function passwordResetRedirect(request: Request) {
  const configured = (process.env.PASSWORD_RESET_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/$/, "");
  return `${configured || new URL(request.url).origin}/auth/reset-password`;
}

/** Thao tác trên một thành viên: khoá / mở khoá tài khoản, gửi email đặt lại mật khẩu. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireStaffApi("Bạn không có quyền quản lý thành viên.", { adminOnly: true });
    if ("error" in admin) return admin.error;

    const { id } = await params;
    if (!UUID_PATTERN.test(id)) return badRequest("Mã thành viên không hợp lệ.");

    const body = await readJsonBody(request);
    const action = body?.action as MemberAction | undefined;
    if (action !== "block" && action !== "unblock" && action !== "reset-password") {
      return badRequest("Thao tác không hợp lệ.");
    }
    if (action === "block" && id === admin.userId) {
      return badRequest("Không thể tự khoá tài khoản đang đăng nhập.");
    }

    const supabase = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,status")
      .eq("id", id)
      .maybeSingle();
    if (profileError) return badRequest(profileError.message);
    if (!profile) return NextResponse.json({ error: "Không tìm thấy thành viên." }, { status: 404 });

    if (action === "reset-password") {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: passwordResetRedirect(request),
      });
      if (error) return badRequest(error.message || "Không thể gửi email đặt lại mật khẩu.");
      return NextResponse.json({ message: `Đã gửi email đặt lại mật khẩu tới ${profile.email}.` });
    }

    const blocking = action === "block";
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: blocking ? BLOCK_DURATION : "none",
    });
    if (authError) return badRequest(authError.message || "Không thể cập nhật tài khoản.");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ status: blocking ? "blocked" : "active", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) return badRequest(updateError.message);

    await logAdminActivity(admin.accessToken, admin.userId, [
      { action: blocking ? "block" : "unblock", targetTable: "profiles", targetId: id },
    ]);

    return NextResponse.json({ status: blocking ? "blocked" : "active" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể thực hiện thao tác." },
      { status: 500 },
    );
  }
}
