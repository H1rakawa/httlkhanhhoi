import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

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
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requireAdmin() {
  const account = await getCurrentAccount();

  if (!account) {
    return {
      error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }),
    };
  }

  if (account.profile?.role !== "admin" || account.profile.status !== "active") {
    return {
      error: NextResponse.json(
        { error: "Bạn không có quyền xem bài tập này." },
        { status: 403 },
      ),
    };
  }

  return { account };
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
    submittedAt: null,
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
        .select("id,user_id,status,grade")
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
