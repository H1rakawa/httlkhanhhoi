import { NextResponse } from "next/server";
import { getGradingSubmission, parseGradeInput, saveGrade } from "@/lib/admin/grading";
import { logAdminActivity } from "@/lib/admin/prayers";
import { badRequest, parseRouteId, readJsonBody, requireStaffApi } from "@/lib/admin/staff";
import { supabaseDataRequest } from "@/lib/supabase/auth";

type RouteProps = { params: Promise<{ id: string; submissionId: string }> };

const FORBIDDEN = "Bạn không có quyền chấm bài.";

async function resolveIds(params: RouteProps["params"]) {
  const { id, submissionId } = await params;
  // Trang chi tiết dùng mã dạng "EX-001" hoặc id số.
  const digits = id.match(/\d+/)?.[0];
  const assignmentId = digits ? parseRouteId(String(Number(digits))) : null;
  return { assignmentId, submissionId: parseRouteId(submissionId) };
}

export async function GET(_request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;

  const { assignmentId, submissionId } = await resolveIds(params);
  if (!assignmentId || !submissionId) return badRequest("Mã bài nộp không hợp lệ.");

  try {
    const submission = await getGradingSubmission(assignmentId, submissionId);
    if (!submission) return NextResponse.json({ error: "Không tìm thấy bài nộp." }, { status: 404 });
    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể tải bài nộp." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const staff = await requireStaffApi(FORBIDDEN);
  if ("error" in staff) return staff.error;

  const { assignmentId, submissionId } = await resolveIds(params);
  if (!assignmentId || !submissionId) return badRequest("Mã bài nộp không hợp lệ.");
  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  try {
    const current = await getGradingSubmission(assignmentId, submissionId);
    if (!current) return NextResponse.json({ error: "Không tìm thấy bài nộp." }, { status: 404 });
    if (current.status === "draft") return badRequest("Học viên chưa nộp bài này.");

    let input;
    try {
      input = parseGradeInput(body, current.questions);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Dữ liệu không hợp lệ.");
    }

    await saveGrade(staff.accessToken, current.id, input);
    const wasGraded = current.status === "graded";

    await Promise.all([
      input.status === "graded" && current.userId !== staff.userId
        ? supabaseDataRequest("notifications", staff.accessToken, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              user_id: current.userId,
              type: "assignment",
              title: wasGraded ? "Điểm bài tập đã được cập nhật" : "Bài tập đã được chấm",
              content: `${current.assignmentTitle}: ${input.grade}/10 điểm.`,
              link: `/assignment/${current.assignmentId}/result`,
            }),
          }).catch(() => undefined)
        : undefined,
      logAdminActivity(staff.accessToken, staff.userId, [
        {
          action: input.status === "graded" ? "grade" : "update",
          targetTable: "submissions",
          targetId: String(current.id),
          metadata: {
            title: current.assignmentTitle,
            student: current.studentName,
            grade: input.grade,
            status: input.status,
          },
        },
      ]),
    ]);

    const submission = await getGradingSubmission(assignmentId, submissionId);
    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể lưu điểm." },
      { status: 500 },
    );
  }
}
