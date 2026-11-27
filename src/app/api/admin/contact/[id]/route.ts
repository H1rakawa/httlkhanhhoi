import { NextResponse } from "next/server";
import { supabaseDataRequest } from "@/lib/supabase/auth";
import {
  CONTACT_SELECT,
  errorResponse,
  mapContactMessage,
  requireStaff,
  type ContactMessageRow,
} from "@/lib/admin/contact";
import { logAdminActivity } from "@/lib/admin/prayers";
import { contactStatusLabel, isContactStatus } from "@/com/admin/contact/adminContactData";

type RouteProps = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  return /^\d+$/.test(raw) ? raw : null;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaff();
  if ("error" in staff) return staff.error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Mã lời nhắn không hợp lệ." }, { status: 400 });

  const payload = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = payload?.status;
  if (!isContactStatus(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
  }

  const patch: Record<string, unknown> = { status };
  if (status === "replied") {
    patch.replied_at = new Date().toISOString();
    patch.handled_by = staff.account.user.id;
  } else if (status === "new") {
    // Đánh dấu chưa đọc: xoá thông tin xử lý.
    patch.replied_at = null;
    patch.handled_by = null;
  }

  try {
    const rows = await supabaseDataRequest<ContactMessageRow[]>(
      `contact_messages?id=eq.${id}&select=${CONTACT_SELECT}`,
      staff.accessToken,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      },
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Không tìm thấy lời nhắn." }, { status: 404 });
    }
    // Chỉ ghi nhật ký các thao tác đáng chú ý (đã phản hồi, lưu trữ).
    if (status === "replied" || status === "archived") {
      await logAdminActivity(staff.accessToken, staff.account.user.id, [
        {
          action: "update",
          targetTable: "contact_messages",
          targetId: id,
          metadata: { status, title: `${rows[0].name} → ${contactStatusLabel[status]}` },
        },
      ]);
    }
    return NextResponse.json({ message: mapContactMessage(rows[0]) });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật lời nhắn.");
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const staff = await requireStaff();
  if ("error" in staff) return staff.error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Mã lời nhắn không hợp lệ." }, { status: 400 });

  try {
    const rows = await supabaseDataRequest<Array<{ id: number }>>(
      `contact_messages?id=eq.${id}&select=id`,
      staff.accessToken,
      { method: "DELETE", headers: { Prefer: "return=representation" } },
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Không tìm thấy lời nhắn." }, { status: 404 });
    }
    await logAdminActivity(staff.accessToken, staff.account.user.id, [
      { action: "delete", targetTable: "contact_messages", targetId: id },
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Không thể xoá lời nhắn.");
  }
}
