import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import {
  deleteEventRegistrations,
  getEventRegistrations,
  updateEventRegistrations,
} from "@/lib/admin/events";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, parseIds, parseRouteId, readJsonBody, requireStaffApi } from "@/lib/admin/staff";
import { isRegistrationStatus } from "@/com/admin/events/adminEventData";

type RouteProps = { params: Promise<{ id: string }> };

const FORBIDDEN = "Bạn không có quyền xem danh sách đăng ký.";

export async function GET(_request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã sự kiện không hợp lệ.");

  try {
    return NextResponse.json({ registrations: await getEventRegistrations(staff.accessToken, id) });
  } catch (error) {
    return errorResponse(error, "Không thể tải danh sách đăng ký.");
  }
}

/** Điểm danh / huỷ / khôi phục đăng ký: { ids, status }. */
export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã sự kiện không hợp lệ.");

  const body = await readJsonBody(request);
  const ids = parseIds(body?.ids);
  if (!ids) return badRequest("Danh sách đăng ký không hợp lệ.");
  if (!isRegistrationStatus(body?.status)) return badRequest("Trạng thái không hợp lệ.");

  try {
    const registrations = await updateEventRegistrations(staff.accessToken, id, ids, body.status);
    await logAdminActivity(
      staff.accessToken,
      staff.userId,
      registrations.map((item) => ({
        action: "update",
        targetTable: "event_registrations",
        targetId: String(item.id),
        metadata: { status: item.status, title: item.fullName, eventId: id },
      })),
    );
    return NextResponse.json({ registrations });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật đăng ký.");
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã sự kiện không hợp lệ.");

  const body = await readJsonBody(request);
  const ids = parseIds(body?.ids);
  if (!ids) return badRequest("Danh sách đăng ký không hợp lệ.");

  try {
    const deleted = await deleteEventRegistrations(staff.accessToken, id, ids);
    await logAdminActivity(
      staff.accessToken,
      staff.userId,
      deleted.map((item) => ({ action: "delete", targetTable: "event_registrations", targetId: String(item) })),
    );
    return NextResponse.json({ deleted });
  } catch (error) {
    return errorResponse(error, "Không thể xoá đăng ký.");
  }
}
