import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, parseRouteId, readJsonBody, requireStaffApi } from "@/lib/admin/staff";
import {
  deleteAdminTestimony,
  parseTestimonyInput,
  statusPatch,
  updateAdminTestimony,
} from "@/lib/admin/testimonies";
import { supabaseDataRequest } from "@/lib/supabase/auth";
import { isTestimonyStatus } from "@/com/admin/preachout/adminTestimonyData";

type RouteProps = { params: Promise<{ id: string }> };

const FORBIDDEN = "Bạn không có quyền quản lý lời làm chứng.";

const NOTIFY: Record<string, { title: string; content: string }> = {
  approved: {
    title: "Lời làm chứng đã được duyệt",
    content: "Cảm ơn bạn đã chia sẻ. Lời làm chứng của bạn đã hiển thị ở trang Truyền giảng.",
  },
  rejected: {
    title: "Lời làm chứng chưa được hiển thị",
    content: "Ban mục vụ đã xem lời làm chứng của bạn nhưng chưa hiển thị công khai lúc này.",
  },
};

/** Sửa toàn bộ, hoặc { quick: true, status } để duyệt / từ chối nhanh. */
export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã lời làm chứng không hợp lệ.");
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let patch: Record<string, unknown>;
  try {
    if (body.quick === true) {
      if (!isTestimonyStatus(body.status)) throw new Error("Trạng thái không hợp lệ.");
      patch = statusPatch(body.status);
    } else {
      patch = parseTestimonyInput(body);
    }
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const testimony = await updateAdminTestimony(staff.accessToken, id, patch);
    if (!testimony) return NextResponse.json({ error: "Không tìm thấy lời làm chứng." }, { status: 404 });

    const notify = body.quick === true ? NOTIFY[testimony.status] : undefined;
    await Promise.all([
      notify && testimony.userId && testimony.userId !== staff.userId
        ? supabaseDataRequest("notifications", staff.accessToken, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ user_id: testimony.userId, type: "system", link: "/preachout", ...notify }),
          }).catch(() => undefined)
        : undefined,
      logAdminActivity(staff.accessToken, staff.userId, [
        {
          action: testimony.status === "approved" ? "approve" : testimony.status === "rejected" ? "reject" : "update",
          targetTable: "testimonies",
          targetId: id,
          metadata: { title: testimony.name, status: testimony.status },
        },
      ]),
    ]);
    return NextResponse.json({ testimony });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật lời làm chứng.");
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã lời làm chứng không hợp lệ.");

  try {
    const deleted = await deleteAdminTestimony(staff.accessToken, id);
    if (!deleted) return NextResponse.json({ error: "Không tìm thấy lời làm chứng." }, { status: 404 });
    await logAdminActivity(staff.accessToken, staff.userId, [
      { action: "delete", targetTable: "testimonies", targetId: id, metadata: { title: deleted.name } },
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Không thể xoá lời làm chứng.");
  }
}
