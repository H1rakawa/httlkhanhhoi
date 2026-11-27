import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import {
  deleteAdminResource,
  getResourceMediaAsset,
  parseResourceInput,
  updateAdminResource,
} from "@/lib/admin/library";
import { linkMediaAsset, removeMediaAsset } from "@/lib/admin/media";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, parseRouteId, readJsonBody, requireStaffApi } from "@/lib/admin/staff";

type RouteProps = { params: Promise<{ id: string }> };

const FORBIDDEN = "Bạn không có quyền quản lý thư viện.";

/** Sửa toàn bộ, hoặc { quick: true, isPublished } để ẩn / hiện nhanh. */
export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã tài liệu không hợp lệ.");
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let patch: Record<string, unknown>;
  try {
    if (body.quick === true) {
      if (typeof body.isPublished !== "boolean") throw new Error("Không có gì để cập nhật.");
      patch = { is_published: body.isPublished };
    } else {
      patch = parseResourceInput(body);
    }
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const previousAsset = "media_asset_id" in patch ? await getResourceMediaAsset(staff.accessToken, id) : null;
    const resource = await updateAdminResource(staff.accessToken, id, patch);
    if (!resource) return NextResponse.json({ error: "Không tìm thấy tài liệu." }, { status: 404 });

    const nextAsset = patch.media_asset_id as string | null | undefined;
    await Promise.all([
      linkMediaAsset(staff.accessToken, nextAsset, "resources", id),
      // Đã thay file khác: xoá file cũ khỏi Storage.
      previousAsset && previousAsset !== nextAsset
        ? removeMediaAsset(staff.accessToken, previousAsset)
        : undefined,
      logAdminActivity(staff.accessToken, staff.userId, [
        {
          action: body.quick === true && patch.is_published ? "publish" : "update",
          targetTable: "resources",
          targetId: id,
          metadata: { title: resource.title },
        },
      ]),
    ]);
    return NextResponse.json({ resource });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật tài liệu.");
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã tài liệu không hợp lệ.");

  try {
    const deleted = await deleteAdminResource(staff.accessToken, id);
    if (!deleted) return NextResponse.json({ error: "Không tìm thấy tài liệu." }, { status: 404 });
    await Promise.all([
      removeMediaAsset(staff.accessToken, deleted.media_asset_id),
      logAdminActivity(staff.accessToken, staff.userId, [
        { action: "delete", targetTable: "resources", targetId: id, metadata: { title: deleted.title } },
      ]),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Không thể xoá tài liệu.");
  }
}
