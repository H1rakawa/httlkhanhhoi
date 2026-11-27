import { NextResponse } from "next/server";
import { PRAYER_CATEGORIES } from "@/com/pray/prayData";
import { getPrayerFeed } from "@/lib/pray/prayers";
import { getAccessToken, getCurrentUser, supabaseDataRequest } from "@/lib/supabase/auth";

type PrayerPayload = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
  privacy?: unknown;
  isAnonymous?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken || !(await getCurrentUser())) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    return NextResponse.json(await getPrayerFeed(undefined, accessToken));
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể tải lời cầu thay.") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để gửi lời cầu thay." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as PrayerPayload | null;
  const title = text(payload?.title);
  const content = text(payload?.content);
  const category = text(payload?.category) || "Tâm linh";
  const privacy = payload?.privacy === "private" ? "private" : "public";

  if (!title || !content) {
    return NextResponse.json({ error: "Vui lòng nhập tiêu đề và nội dung." }, { status: 400 });
  }
  if (title.length > 200) {
    return NextResponse.json({ error: "Tiêu đề tối đa 200 ký tự." }, { status: 400 });
  }
  if (content.length > 4000) {
    return NextResponse.json({ error: "Nội dung tối đa 4000 ký tự." }, { status: 400 });
  }
  if (!(PRAYER_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Chủ đề không hợp lệ." }, { status: 400 });
  }

  try {
    // Trigger guard_prayer_request luôn đặt status = 'pending' cho thành viên.
    await supabaseDataRequest("prayer_requests", accessToken, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        title,
        content,
        category,
        privacy,
        is_anonymous: payload?.isAnonymous === true,
      }),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Không thể gửi lời cầu thay.") },
      { status: 500 },
    );
  }
}
