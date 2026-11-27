import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { linkMediaAsset, removeMediaAsset } from "@/lib/admin/media";
import {
  deleteAdminNewsPost,
  getNewsPostState,
  isNewsStatus,
  parseNewsInput,
  updateAdminNewsPost,
} from "@/lib/admin/news";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, parseRouteId, readJsonBody, requireStaffApi } from "@/lib/admin/staff";

type RouteProps = { params: Promise<{ id: string }> };

const FORBIDDEN = "Bạn không có quyền quản lý tin tức.";

/** Sửa toàn bộ, hoặc { quick: true, status?, featured? } từ bảng. */
export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã bài viết không hợp lệ.");
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let current: Awaited<ReturnType<typeof getNewsPostState>>;
  try {
    current = await getNewsPostState(staff.accessToken, id);
  } catch (error) {
    return errorResponse(error, "Không thể đọc bài viết.");
  }
  if (!current) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  let patch: Record<string, unknown>;
  try {
    if (body.quick === true) {
      patch = {};
      if (body.status !== undefined) {
        if (!isNewsStatus(body.status)) throw new Error("Trạng thái không hợp lệ.");
        if (body.status === "published" && !current.photo_url) {
          throw new Error("Bài viết cần có ảnh bìa trước khi đăng. Bấm “Sửa” để thêm ảnh.");
        }
        patch.status = body.status;
        if (body.status === "published" && !current.published_at) patch.published_at = new Date().toISOString();
      }
      if (typeof body.featured === "boolean") patch.featured = body.featured;
      if (!Object.keys(patch).length) throw new Error("Không có gì để cập nhật.");
    } else {
      const input = parseNewsInput(body);
      // Giữ ngày đăng cũ khi sửa bài đã đăng mà không chọn ngày mới.
      if (!body.publishedAt && current.published_at) input.published_at = current.published_at;
      patch = input;
    }
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const post = await updateAdminNewsPost(staff.accessToken, id, patch);
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    const nextAsset = patch.media_asset_id as string | null | undefined;
    await Promise.all([
      linkMediaAsset(staff.accessToken, nextAsset, "news_posts", id),
      "media_asset_id" in patch && current.media_asset_id && current.media_asset_id !== nextAsset
        ? removeMediaAsset(staff.accessToken, current.media_asset_id)
        : undefined,
      logAdminActivity(staff.accessToken, staff.userId, [
        {
          action: patch.status === "published" && body.quick === true ? "publish" : "update",
          targetTable: "news_posts",
          targetId: id,
          metadata: { title: post.title },
        },
      ]),
    ]);
    return NextResponse.json({ post });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật bài viết.", 400);
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const id = parseRouteId((await params).id);
  if (!id) return badRequest("Mã bài viết không hợp lệ.");

  try {
    const deleted = await deleteAdminNewsPost(staff.accessToken, id);
    if (!deleted) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    await Promise.all([
      removeMediaAsset(staff.accessToken, deleted.media_asset_id),
      logAdminActivity(staff.accessToken, staff.userId, [
        { action: "delete", targetTable: "news_posts", targetId: id, metadata: { title: deleted.title } },
      ]),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Không thể xoá bài viết.");
  }
}
