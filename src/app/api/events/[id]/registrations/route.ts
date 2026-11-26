import { NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentAccount,
  supabaseDataRequest,
} from "@/lib/supabase/auth";

type RegistrationRouteProps = {
  params: Promise<{ id: string }>;
};

type RegistrationPayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  attendees?: number;
  note?: string;
};

type ExistingRegistration = { id: number; status: string };

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function parseEventId(id: string) {
  return /^\d+$/.test(id) ? id : null;
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("event_registrations_event_id_user_id_key") || message.includes("duplicate")) {
    return "Bạn đã đăng ký sự kiện này rồi.";
  }
  return message || "Không thể đăng ký sự kiện. Vui lòng thử lại.";
}

export async function POST(request: Request, { params }: RegistrationRouteProps) {
  const eventId = parseEventId((await params).id);
  if (!eventId) return errorResponse("Sự kiện không hợp lệ.", 404);

  const payload = (await request.json().catch(() => null)) as RegistrationPayload | null;
  const attendees = Math.min(Math.max(Math.trunc(Number(payload?.attendees) || 1), 1), 20);
  const phone = text(payload?.phone, 30);
  const email = text(payload?.email, 320);
  const note = text(payload?.note, 1000);

  if (email && !EMAIL_PATTERN.test(email)) {
    return errorResponse("Email không hợp lệ.");
  }

  const account = await getCurrentAccount();

  try {
    if (!account) {
      const fullName = text(payload?.fullName, 200);
      if (!fullName) return errorResponse("Vui lòng nhập họ tên.");
      if (!phone && !email) return errorResponse("Vui lòng để lại số điện thoại hoặc email.");

      // anon không SELECT được event_registrations nên dùng return=minimal.
      await supabaseDataRequest("event_registrations", undefined, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          event_id: Number(eventId),
          full_name: fullName,
          phone: phone || null,
          email: email || null,
          attendees,
          note: note || null,
        }),
      });

      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const accessToken = await getAccessToken();
    const { user, profile } = account;
    const fullName =
      text(payload?.fullName, 200) ||
      profile?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      "Thành viên";

    const existing = await supabaseDataRequest<ExistingRegistration[]>(
      `event_registrations?event_id=eq.${eventId}&user_id=eq.${user.id}&select=id,status`,
      accessToken,
    );

    if (existing[0] && existing[0].status !== "cancelled") {
      return errorResponse("Bạn đã đăng ký sự kiện này rồi.", 409);
    }

    const body = {
      full_name: fullName,
      phone: phone || profile?.phone || null,
      email: email || profile?.email || user.email || null,
      attendees,
      note: note || null,
      status: "registered",
    };

    if (existing[0]) {
      await supabaseDataRequest(`event_registrations?id=eq.${existing[0].id}`, accessToken, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(body),
      });
    } else {
      await supabaseDataRequest("event_registrations", accessToken, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ ...body, event_id: Number(eventId), user_id: user.id }),
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return errorResponse(friendlyError(error));
  }
}

/** Thành viên huỷ đăng ký của chính mình. */
export async function DELETE(_request: Request, { params }: RegistrationRouteProps) {
  const eventId = parseEventId((await params).id);
  if (!eventId) return errorResponse("Sự kiện không hợp lệ.", 404);

  const account = await getCurrentAccount();
  if (!account) return errorResponse("Vui lòng đăng nhập để huỷ đăng ký.", 401);

  try {
    await supabaseDataRequest(
      `event_registrations?event_id=eq.${eventId}&user_id=eq.${account.user.id}&status=eq.registered`,
      await getAccessToken(),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "cancelled" }),
      },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(friendlyError(error));
  }
}
