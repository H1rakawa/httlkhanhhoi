import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { createAdminResource, getAdminResources, parseResourceInput } from "@/lib/admin/library";
import { linkMediaAsset } from "@/lib/admin/media";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, readJsonBody, requireStaffApi } from "@/lib/admin/staff";

const FORBIDDEN = "Bạn không có quyền quản lý thư viện.";

export async function GET() {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  try {
    return NextResponse.json({ resources: await getAdminResources(staff.accessToken) });
  } catch (error) {
    return errorResponse(error, "Không thể tải thư viện.");
  }
}

export async function POST(request: Request) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let input: ReturnType<typeof parseResourceInput>;
  try {
    input = parseResourceInput(body);
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const resource = await createAdminResource(staff.accessToken, staff.userId, input);
    await Promise.all([
      linkMediaAsset(staff.accessToken, input.media_asset_id, "resources", resource.id),
      logAdminActivity(staff.accessToken, staff.userId, [
        { action: "create", targetTable: "resources", targetId: String(resource.id), metadata: { title: resource.title } },
      ]),
    ]);
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Không thể thêm tài liệu.");
  }
}
