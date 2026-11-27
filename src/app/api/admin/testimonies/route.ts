import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, readJsonBody, requireStaffApi } from "@/lib/admin/staff";
import { createAdminTestimony, getAdminTestimonies, parseTestimonyInput } from "@/lib/admin/testimonies";

const FORBIDDEN = "Bạn không có quyền quản lý lời làm chứng.";

export async function GET() {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  try {
    return NextResponse.json({ testimonies: await getAdminTestimonies(staff.accessToken) });
  } catch (error) {
    return errorResponse(error, "Không thể tải lời làm chứng.");
  }
}

/** Ban mục vụ nhập lời làm chứng thay cho người chia sẻ (vd: ghi lại sau buổi truyền giảng). */
export async function POST(request: Request) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  let input: ReturnType<typeof parseTestimonyInput>;
  try {
    input = parseTestimonyInput(body);
  } catch (error) {
    return errorResponse(error, "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const testimony = await createAdminTestimony(staff.accessToken, staff.userId, input);
    await logAdminActivity(staff.accessToken, staff.userId, [
      { action: "create", targetTable: "testimonies", targetId: String(testimony.id), metadata: { title: testimony.name } },
    ]);
    return NextResponse.json({ testimony }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Không thể thêm lời làm chứng.");
  }
}
