import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/dashboard/notifications";
import { getAccessToken, getCurrentUser, supabaseDataRequest } from "@/lib/supabase/auth";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function GET() {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    return NextResponse.json(await getNotifications(user.id, accessToken, 50));
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể tải thông báo.") },
      { status: 500 },
    );
  }
}

/** Đánh dấu đã đọc: body { ids: string[] } hoặc { all: true }. */
export async function PATCH(request: Request) {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { ids?: unknown; all?: unknown }
    | null;
  const ids = Array.isArray(payload?.ids)
    ? payload.ids.map(String).filter((id) => /^\d+$/.test(id))
    : [];
  if (payload?.all !== true && ids.length === 0) {
    return NextResponse.json({ error: "Chưa chọn thông báo." }, { status: 400 });
  }

  const filter = payload?.all === true ? "is_read=eq.false" : `id=in.(${ids.join(",")})`;
  try {
    await supabaseDataRequest(
      `notifications?user_id=eq.${user.id}&${filter}`,
      accessToken,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ is_read: true }),
      },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể cập nhật thông báo.") },
      { status: 500 },
    );
  }
}
