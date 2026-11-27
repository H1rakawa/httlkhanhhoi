import { NextResponse } from "next/server";
import { getPrayerComments, parsePrayerId } from "@/lib/pray/prayers";
import { getAccessToken, getCurrentUser, supabaseDataRequest } from "@/lib/supabase/auth";

type RouteProps = { params: Promise<{ id: string }> };

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const id = parsePrayerId((await params).id);
  if (!id) return NextResponse.json({ error: "Không tìm thấy lời cầu thay." }, { status: 404 });

  try {
    return NextResponse.json(await getPrayerComments(id, accessToken));
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể tải lời động viên.") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const id = parsePrayerId((await params).id);
  if (!id) return NextResponse.json({ error: "Không tìm thấy lời cầu thay." }, { status: 404 });

  const payload = (await request.json().catch(() => null)) as { message?: unknown } | null;
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Vui lòng nhập lời động viên." }, { status: 400 });
  if (message.length > 1000) {
    return NextResponse.json({ error: "Lời động viên tối đa 1000 ký tự." }, { status: 400 });
  }

  try {
    await supabaseDataRequest("prayer_comments", accessToken, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ prayer_id: id, user_id: user.id, message }),
    });
    return NextResponse.json(await getPrayerComments(id, accessToken), { status: 201 });
  } catch (error) {
    const text = errorMessage(error, "");
    if (text.includes("row-level security")) {
      return NextResponse.json(
        { error: "Lời cầu thay này chưa được duyệt nên chưa thể gửi lời động viên." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: text || "Không thể gửi lời động viên." },
      { status: 500 },
    );
  }
}
