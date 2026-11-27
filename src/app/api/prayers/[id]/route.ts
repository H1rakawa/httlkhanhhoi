import { NextResponse } from "next/server";
import { parsePrayerId } from "@/lib/pray/prayers";
import { getAccessToken, supabaseDataRequest } from "@/lib/supabase/auth";

type RouteProps = { params: Promise<{ id: string }> };

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Chủ lời cầu nguyện đánh dấu "đã được nhậm lời" (approved → answered). */
export async function PATCH(request: Request, { params }: RouteProps) {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const id = parsePrayerId((await params).id);
  if (!id) return NextResponse.json({ error: "Không tìm thấy lời cầu thay." }, { status: 404 });

  const payload = (await request.json().catch(() => null)) as { status?: unknown } | null;
  if (payload?.status !== "answered") {
    return NextResponse.json({ error: "Thao tác không hợp lệ." }, { status: 400 });
  }

  try {
    const rows = await supabaseDataRequest<Array<{ id: number }>>(
      `prayer_requests?id=eq.${id}&status=eq.approved&select=id`,
      accessToken,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ status: "answered" }),
      },
    );
    if (!rows.length) {
      return NextResponse.json(
        { error: "Chỉ người gửi mới đánh dấu được lời cầu thay đã được duyệt." },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể cập nhật lời cầu thay.") },
      { status: 500 },
    );
  }
}

/** Người gửi (hoặc ban mục vụ) xoá lời cầu thay. RLS kiểm tra quyền. */
export async function DELETE(_request: Request, { params }: RouteProps) {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const id = parsePrayerId((await params).id);
  if (!id) return NextResponse.json({ error: "Không tìm thấy lời cầu thay." }, { status: 404 });

  try {
    const rows = await supabaseDataRequest<Array<{ id: number }>>(
      `prayer_requests?id=eq.${id}&select=id`,
      accessToken,
      { method: "DELETE", headers: { Prefer: "return=representation" } },
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Bạn không thể xoá lời cầu thay này." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể xoá lời cầu thay.") },
      { status: 500 },
    );
  }
}
