import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { deleteAdminEvent, parseEventInput, updateAdminEvent } from "@/lib/admin/events";
import { linkMediaAsset, removeMediaAsset } from "@/lib/admin/media";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, parseRouteId, readJsonBody, requireStaffApi } from "@/lib/admin/staff";
import { isEventStatus } from "@/com/admin/events/adminEventData";

type RouteProps = { params: Promise<{ id: string }> };

const FORBIDDEN = "Bạn không có quyền quản lý sự kiện.";

/**
 * Sửa sự kiện. Gửi toàn bộ form, hoặc { quick: true, status?, registrationOpen?, featured? }
 * để bật / tắt nhanh từ bảng.
 */
export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;

  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã sự kiện không hợp lệ.");
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let patch: Record<string, unknown>;
  try {
    if (body.quick === true) {
      patch = {};
      if (body.status !== undefined) {
        if (!isEventStatus(body.status)) throw new Error("Trạng thái không hợp lệ.");
        patch.status = body.status;
      }
      if (typeof body.registrationOpen === "boolean") patch.registration_open = body.registrationOpen;
      if (typeof body.featured === "boolean") patch.featured = body.featured;
      if (!Object.keys(patch).length) throw new Error("Không có gì để cập nhật.");
    } else {
      patch = parseEventInput(body);
    }
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const event = await updateAdminEvent(staff.accessToken, id, patch);
    if (!event) return NextResponse.json({ error: "Không tìm thấy sự kiện." }, { status: 404 });
    await Promise.all([
      linkMediaAsset(staff.accessToken, patch.media_asset_id as string | null, "events", id),
      logAdminActivity(staff.accessToken, staff.userId, [
        { action: "update", targetTable: "events", targetId: id, metadata: { title: event.title } },
      ]),
    ]);
    return NextResponse.json({ event });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật sự kiện.");
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;

  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã sự kiện không hợp lệ.");

  try {
    const deleted = await deleteAdminEvent(staff.accessToken, id);
    if (!deleted) return NextResponse.json({ error: "Không tìm thấy sự kiện." }, { status: 404 });
    await Promise.all([
      removeMediaAsset(staff.accessToken, deleted.media_asset_id),
      logAdminActivity(staff.accessToken, staff.userId, [
        { action: "delete", targetTable: "events", targetId: id, metadata: { title: deleted.title } },
      ]),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Không thể xoá sự kiện.");
  }
}
