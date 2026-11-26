import { NextResponse } from "next/server";
import { getAccessToken, supabaseDataRequest } from "@/lib/supabase/auth";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  /** Bẫy bot: trường ẩn, người thật để trống. */
  website?: unknown;
};

// Khớp các CHECK của bảng public.contact_messages.
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_PATTERN = /^[+\d\s().-]{6,30}$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ContactPayload | null;
  if (!payload) return badRequest("Dữ liệu gửi lên không hợp lệ.");

  // Bot điền trường ẩn: trả về thành công nhưng không lưu.
  if (text(payload.website)) return NextResponse.json({ ok: true }, { status: 201 });

  const name = text(payload.name);
  const email = text(payload.email);
  const phone = text(payload.phone);
  const message = text(payload.message);

  if (!name || !email || !phone || !message) {
    return badRequest("Vui lòng nhập đầy đủ họ tên, email, số điện thoại và nội dung.");
  }
  if (name.length > 200) return badRequest("Họ tên tối đa 200 ký tự.");
  if (email.length > 320 || !EMAIL_PATTERN.test(email)) return badRequest("Email không hợp lệ.");
  if (!PHONE_PATTERN.test(phone)) return badRequest("Số điện thoại không hợp lệ.");
  if (message.length > 5000) return badRequest("Nội dung tối đa 5000 ký tự.");

  try {
    // anon/authenticated chỉ được INSERT (không SELECT) nên dùng return=minimal.
    await supabaseDataRequest("contact_messages", await getAccessToken(), {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ name, email, phone, message }),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message
            ? `Không thể gửi lời nhắn: ${error.message}`
            : "Không thể gửi lời nhắn. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
