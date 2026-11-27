import { NextResponse } from "next/server";
import { logAdminActivity } from "@/lib/admin/prayers";
import { requireStaffApi } from "@/lib/admin/staff";
import {
  assignmentWriteError,
  cleanText,
  countSubmissions,
  duplicateAssignment,
  formatExamCode,
  insertQuestions,
  isExamStatus,
  normalizeCategory,
  normalizeQuestions,
  publishError,
  createSupabaseAdminClient,
  rawAssignmentId as parseAssignmentId,
  type ExamPayload,
} from "@/lib/admin/exams";

type AdminExamDetailRouteProps = {
  params: Promise<{ id: string }>;
};

type AssignmentDetailRow = {
  id: number;
  title: string;
  description: string | null;
  assignment_code: string | null;
  category: string | null;
  week_number: number | null;
  due_date: string | null;
  attachment_url: string | null;
  admin_status: "ongoing" | "upcoming" | "ended" | "draft";
  media_asset:
    | {
        public_url: string | null;
        media_kind: string | null;
        mime_type: string | null;
        size_bytes: number | null;
        file_name: string | null;
      }
    | null;
  assignment_questions?: Array<{
    id: number;
    question_type: "multiple_choice" | "essay";
    prompt: string;
    helper_text: string | null;
    scripture_reference: string | null;
    answer_hint: string | null;
    allow_multiple: boolean;
    sort_order: number;
    assignment_question_options?: Array<{
      option_text: string;
      is_correct: boolean;
      sort_order: number;
    }>;
  }>;
};

type SubmissionRow = {
  id: number | string;
  user_id: string;
  status: "draft" | "submitted" | "graded";
  grade?: number | null;
  submitted_at?: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

function requireAdmin() {
  return requireStaffApi("Bạn không có quyền xem bài tập này.");
}

function rawAssignmentId(id: string) {
  const match = id.match(/\d+/);
  return match ? String(Number(match[0])) : id;
}

function mapQuestion(question: NonNullable<AssignmentDetailRow["assignment_questions"]>[number]) {
  return {
    id: String(question.id),
    type: question.question_type,
    prompt: question.prompt,
    helperText: question.helper_text,
    scriptureReference: question.scripture_reference,
    answerHint: question.answer_hint,
    allowMultiple: question.allow_multiple,
    options: (question.assignment_question_options ?? [])
      .slice()
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((option) => ({
        text: option.option_text,
        isCorrect: option.is_correct,
      })),
  };
}

function mediaTitle(assignment: AssignmentDetailRow) {
  if (assignment.media_asset?.file_name) return assignment.media_asset.file_name;
  if (assignment.media_asset?.media_kind === "audio") return "Audio đính kèm";
  if (assignment.media_asset?.media_kind === "video") return "Video đính kèm";
  if (assignment.attachment_url) return "Tài liệu đính kèm";
  return "";
}

function mapSubmission(submission: SubmissionRow, profiles: Map<string, ProfileRow>) {
  const profile = profiles.get(submission.user_id);

  return {
    id: String(submission.id),
    userId: submission.user_id,
    name: profile?.name || profile?.email || "Học viên",
    email: profile?.email || "",
    avatarUrl: profile?.avatar_url || null,
    status: submission.status,
    grade: submission.grade ?? null,
    submittedAt: submission.submitted_at ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: AdminExamDetailRouteProps,
) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const { id } = await params;
    const assignmentId = rawAssignmentId(id);
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from("assignments")
      .select(
        "id,title,description,assignment_code,category,week_number,due_date,attachment_url,admin_status,media_asset:media_asset_id(public_url,media_kind,mime_type,size_bytes,file_name),assignment_questions(id,question_type,prompt,helper_text,scripture_reference,answer_hint,allow_multiple,sort_order,assignment_question_options(option_text,is_correct,sort_order))",
      )
      .eq("id", assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: assignmentError?.message || "Không tìm thấy bài tập." },
        { status: 404 },
      );
    }

    const assignmentRow = assignment as unknown as AssignmentDetailRow;
    const [{ count: totalStudents }, submissionsResult] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "member"),
      supabaseAdmin
        .from("submissions")
        .select("id,user_id,status,grade,submitted_at")
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .eq("assignment_id", assignmentRow.id),
    ]);

    if (submissionsResult.error) {
      return NextResponse.json(
        {
          error:
            submissionsResult.error.message ||
            "Không thể tải danh sách học viên đã nộp.",
        },
        { status: 400 },
      );
    }

    const submissions = (submissionsResult.data ?? []) as SubmissionRow[];
    const userIds = [...new Set(submissions.map((submission) => submission.user_id))];
    const profiles = new Map<string, ProfileRow>();

    if (userIds.length > 0) {
      const { data: profileRows } = await supabaseAdmin
        .from("profiles")
        .select("id,name,email,avatar_url")
        .in("id", userIds);

      for (const profile of (profileRows ?? []) as ProfileRow[]) {
        profiles.set(profile.id, profile);
      }
    }

    const completed = submissions.filter(
      (submission) =>
        submission.status === "submitted" || submission.status === "graded",
    ).length;
    const studentTotal = Math.max(totalStudents ?? 0, submissions.length);
    const pending = Math.max(studentTotal - completed, 0);
    const attachmentUrl =
      assignmentRow.media_asset?.public_url || assignmentRow.attachment_url || null;

    return NextResponse.json({
      assignment: {
        id: `EX-${String(assignmentRow.id).padStart(3, "0")}`,
        rawId: assignmentRow.id,
        title: assignmentRow.title,
        description:
          assignmentRow.description || "Bài tập học tập và rèn luyện của cộng đồng.",
        rawDescription: assignmentRow.description ?? "",
        code: assignmentRow.assignment_code,
        category: assignmentRow.category || "Bài tập",
        weekNumber: assignmentRow.week_number,
        dueDate: assignmentRow.due_date,
        status: assignmentRow.admin_status,
        attachment: attachmentUrl
          ? {
              title: mediaTitle(assignmentRow),
              url: attachmentUrl,
              mimeType: assignmentRow.media_asset?.mime_type || null,
              mediaKind: assignmentRow.media_asset?.media_kind || null,
              sizeBytes: assignmentRow.media_asset?.size_bytes || null,
            }
          : null,
        questions: (assignmentRow.assignment_questions ?? [])
          .slice()
          .sort((first, second) => first.sort_order - second.sort_order)
          .map(mapQuestion),
      },
      stats: {
        totalStudents: studentTotal,
        completed,
        pending,
      },
      students: submissions.map((submission) => mapSubmission(submission, profiles)),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải chi tiết bài tập.",
      },
      { status: 500 },
    );
  }
}

const STATUS_ACTION: Record<string, string> = {
  ongoing: "publish",
  ended: "update",
  upcoming: "update",
  draft: "update",
};

function errorResponse(error: unknown, fallback: string, status = 500) {
  return NextResponse.json({ error: error instanceof Error ? error.message : fallback }, { status });
}

/**
 * PATCH { quick: true, status }  → đổi trạng thái nhanh từ danh sách.
 * PATCH { action, title, ... }   → lưu từ trang chỉnh sửa. Khi đã có học viên làm bài,
 * câu hỏi được giữ nguyên để không làm hỏng bài nộp và đáp án đã chấm.
 */
export async function PATCH(request: Request, { params }: AdminExamDetailRouteProps) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const assignmentId = parseAssignmentId((await params).id);
  if (!assignmentId) return NextResponse.json({ error: "Mã bài tập không hợp lệ." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as (ExamPayload & { quick?: boolean; status?: string }) | null;
  if (!body) return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: current } = await supabaseAdmin
      .from("assignments")
      .select("id,title,admin_status,assignment_questions(count)")
      .eq("id", assignmentId)
      .maybeSingle();
    if (!current) return NextResponse.json({ error: "Không tìm thấy bài tập." }, { status: 404 });

    const submissions = await countSubmissions(supabaseAdmin, assignmentId);

    if (body.quick === true) {
      if (!isExamStatus(body.status)) return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
      const questionCount =
        (current.assignment_questions as unknown as Array<{ count: number }> | null)?.[0]?.count ?? 0;
      if (body.status === "ongoing" && questionCount === 0) {
        return NextResponse.json({ error: "Bài tập chưa có câu hỏi nên chưa thể đăng." }, { status: 400 });
      }
      if (body.status === "draft" && submissions.total > 0) {
        return NextResponse.json(
          { error: "Đã có học viên làm bài nên không thể chuyển về nháp. Hãy dùng “Kết thúc” thay thế." },
          { status: 400 },
        );
      }

      const { error } = await supabaseAdmin
        .from("assignments")
        .update({
          admin_status: body.status,
          icon_tone: body.status === "draft" ? "gold" : body.status === "ended" ? "dark" : "blue",
        })
        .eq("id", assignmentId);
      if (error) throw new Error(error.message);

      await logAdminActivity(admin.accessToken, admin.userId, [
        {
          action: STATUS_ACTION[body.status],
          targetTable: "assignments",
          targetId: assignmentId,
          metadata: { title: current.title, status: body.status },
        },
      ]);
      return NextResponse.json({ exam: { id: formatExamCode(assignmentId), status: body.status } });
    }

    const lockQuestions = submissions.total > 0;
    const isPublish = body.action === "publish";
    const title = cleanText(body.title);
    const questions = normalizeQuestions(body);

    if (isPublish && !lockQuestions) {
      const message = publishError(title, questions);
      if (message) return NextResponse.json({ error: message }, { status: 400 });
    }
    if (isPublish && lockQuestions && !title) {
      return NextResponse.json({ error: "Vui lòng nhập tiêu đề bài tập." }, { status: 400 });
    }
    if (!isPublish && lockQuestions) {
      return NextResponse.json(
        { error: "Đã có học viên làm bài nên không thể chuyển về nháp." },
        { status: 400 },
      );
    }

    // Bài đang mở / sắp mở / đã kết thúc thì giữ trạng thái khi "Lưu"; bản nháp thì đăng.
    const nextStatus = isPublish
      ? current.admin_status === "draft"
        ? "ongoing"
        : current.admin_status
      : "draft";

    const { error: updateError } = await supabaseAdmin
      .from("assignments")
      .update({
        title: title || "Bài tập chưa đặt tên",
        assignment_code: cleanText(body.code) || null,
        category: normalizeCategory(body.category),
        description: cleanText(body.description) || null,
        admin_status: nextStatus,
        icon_tone: nextStatus === "draft" ? "gold" : nextStatus === "ended" ? "dark" : "blue",
      })
      .eq("id", assignmentId);
    if (updateError) {
      return NextResponse.json(
        { error: assignmentWriteError(updateError, "Không thể lưu bài tập.") },
        { status: 400 },
      );
    }

    if (!lockQuestions) {
      const { error: deleteError } = await supabaseAdmin
        .from("assignment_questions")
        .delete()
        .eq("assignment_id", assignmentId);
      if (deleteError) throw new Error(deleteError.message);
      const questionError = await insertQuestions(supabaseAdmin, Number(assignmentId), questions);
      if (questionError) return NextResponse.json({ error: questionError }, { status: 400 });
    }

    await logAdminActivity(admin.accessToken, admin.userId, [
      { action: "update", targetTable: "assignments", targetId: assignmentId, metadata: { title } },
    ]);
    return NextResponse.json({
      exam: { id: formatExamCode(assignmentId), status: nextStatus },
      questionsLocked: lockQuestions,
    });
  } catch (error) {
    return errorResponse(error, "Không thể lưu bài tập.");
  }
}

/** Xoá bài tập. Đã có học viên nộp bài thì chặn để không mất điểm, gợi ý "Kết thúc". */
export async function DELETE(_request: Request, { params }: AdminExamDetailRouteProps) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const assignmentId = parseAssignmentId((await params).id);
  if (!assignmentId) return NextResponse.json({ error: "Mã bài tập không hợp lệ." }, { status: 400 });

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const submissions = await countSubmissions(supabaseAdmin, assignmentId);
    if (submissions.finished > 0) {
      return NextResponse.json(
        {
          error: `Đã có ${submissions.finished} học viên nộp bài nên không thể xoá. Hãy dùng “Kết thúc” để đóng bài tập.`,
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("id", assignmentId)
      .select("id,title");
    if (error) throw new Error(error.message);
    if (!data?.length) return NextResponse.json({ error: "Không tìm thấy bài tập." }, { status: 404 });

    await logAdminActivity(admin.accessToken, admin.userId, [
      { action: "delete", targetTable: "assignments", targetId: assignmentId, metadata: { title: data[0].title } },
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Không thể xoá bài tập.");
  }
}

/** POST { action: "duplicate" }: tạo bản nháp sao chép thông tin và câu hỏi. */
export async function POST(request: Request, { params }: AdminExamDetailRouteProps) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const assignmentId = parseAssignmentId((await params).id);
  if (!assignmentId) return NextResponse.json({ error: "Mã bài tập không hợp lệ." }, { status: 400 });
  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  if (body?.action !== "duplicate") return NextResponse.json({ error: "Thao tác không hợp lệ." }, { status: 400 });

  try {
    const copy = await duplicateAssignment(createSupabaseAdminClient(), assignmentId, admin.userId);
    if (!copy) return NextResponse.json({ error: "Không tìm thấy bài tập." }, { status: 404 });

    await logAdminActivity(admin.accessToken, admin.userId, [
      { action: "create", targetTable: "assignments", targetId: String(copy.id), metadata: { title: copy.title } },
    ]);
    return NextResponse.json(
      { exam: { id: formatExamCode(copy.id), title: copy.title, status: copy.admin_status } },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Không thể nhân bản bài tập.");
  }
}
