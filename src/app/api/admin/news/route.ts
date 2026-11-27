import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { linkMediaAsset } from "@/lib/admin/media";
import { createAdminNewsPost, getAdminNewsPosts, parseNewsInput } from "@/lib/admin/news";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, readJsonBody, requireStaffApi } from "@/lib/admin/staff";

const FORBIDDEN = "Bạn không có quyền quản lý tin tức.";

export async function GET() {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  try {
    return NextResponse.json({ posts: await getAdminNewsPosts(staff.accessToken) });
  } catch (error) {
    return errorResponse(error, "Không thể tải tin tức.");
  }
}

export async function POST(request: Request) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let input: ReturnType<typeof parseNewsInput>;
  try {
    input = parseNewsInput(body);
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const post = await createAdminNewsPost(staff.accessToken, staff.userId, input);
    await Promise.all([
      linkMediaAsset(staff.accessToken, input.media_asset_id, "news_posts", post.id),
      logAdminActivity(staff.accessToken, staff.userId, [
        {
          action: post.status === "published" ? "publish" : "create",
          targetTable: "news_posts",
          targetId: String(post.id),
          metadata: { title: post.title },
        },
      ]),
    ]);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Không thể tạo bài viết.", 400);
  }
}
