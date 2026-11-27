import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { createAdminEvent, getAdminEvents, parseEventInput } from "@/lib/admin/events";
import { linkMediaAsset } from "@/lib/admin/media";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, readJsonBody, requireStaffApi } from "@/lib/admin/staff";

const FORBIDDEN = "Bạn không có quyền quản lý sự kiện.";

export async function GET() {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  try {
    return NextResponse.json({ events: await getAdminEvents(staff.accessToken) });
  } catch (error) {
    return errorResponse(error, "Không thể tải danh sách sự kiện.");
  }
}

export async function POST(request: Request) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;

  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let input: ReturnType<typeof parseEventInput>;
  try {
    input = parseEventInput(body);
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const event = await createAdminEvent(staff.accessToken, staff.userId, input);
    await Promise.all([
      linkMediaAsset(staff.accessToken, input.media_asset_id, "events", event.id),
      logAdminActivity(staff.accessToken, staff.userId, [
        { action: "create", targetTable: "events", targetId: String(event.id), metadata: { title: event.title } },
      ]),
    ]);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Không thể tạo sự kiện.");
  }
}
