import { NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentUser,
  supabaseDataRequest,
} from "@/lib/supabase/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const notifications = await supabaseDataRequest(
      `notifications?user_id=eq.${user.id}&select=id,content,is_read,created_at&order=created_at.desc`,
      await getAccessToken(),
    );
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải thông báo.",
      },
      { status: 500 },
    );
  }
}
