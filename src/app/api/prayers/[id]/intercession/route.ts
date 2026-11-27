import { NextResponse } from "next/server";
import { parsePrayerId } from "@/lib/pray/prayers";
import { getAccessToken, getCurrentUser, supabaseDataRequest } from "@/lib/supabase/auth";

type RouteProps = { params: Promise<{ id: string }> };

async function context(params: RouteProps["params"]) {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  const id = parsePrayerId((await params).id);
  return { accessToken, user, id };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** "Tôi đã cầu thay". Trigger cập nhật intercession_count. */
export async function POST(_request: Request, { params }: RouteProps) {
  const { accessToken, user, id } = await context(params);
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (!id) return NextResponse.json({ error: "Không tìm thấy lời cầu thay." }, { status: 404 });

  try {
    await supabaseDataRequest("prayer_intercessions", accessToken, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ prayer_id: id, user_id: user.id }),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = errorMessage(error, "");
    // Đã cầu thay rồi (trùng khoá chính): coi như thành công.
    if (message.includes("duplicate key")) return NextResponse.json({ ok: true });
    if (message.includes("row-level security")) {
      return NextResponse.json(
        { error: "Lời cầu thay này chưa được duyệt nên chưa thể cầu thay." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: message || "Không thể ghi nhận cầu thay." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { accessToken, user, id } = await context(params);
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (!id) return NextResponse.json({ error: "Không tìm thấy lời cầu thay." }, { status: 404 });

  try {
    await supabaseDataRequest(
      `prayer_intercessions?prayer_id=eq.${id}&user_id=eq.${user.id}`,
      accessToken,
      { method: "DELETE", headers: { Prefer: "return=minimal" } },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể huỷ cầu thay.") },
      { status: 500 },
    );
  }
}
