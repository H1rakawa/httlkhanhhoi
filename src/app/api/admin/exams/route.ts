import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getSupabaseConfig,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/config";

const validStatuses = new Set(["ongoing", "upcoming", "ended", "draft"]);

type AssignmentRow = {
  id: number;
  title: string;
  description: string | null;
  week_number: number | null;
  due_date: string | null;
  admin_status: "ongoing" | "upcoming" | "ended" | "draft";
  icon_tone: "blue" | "gold" | "dark";
  submissions?: Array<{
    status: "draft" | "submitted" | "graded";
  }>;
};

type ExamQuestionPayload = {
  type?: string;
  prompt?: string;
  helperText?: string;
  scriptureReference?: string;
  answerHint?: string;
  allowMultiple?: boolean;
  options?: Array<{
    text?: string;
    isCorrect?: boolean;
  }>;
};

type CreateExamPayload = {
  action?: "draft" | "publish";
  title?: string;
  code?: string;
  category?: string;
  dueDate?: string;
  description?: string;
  questions?: ExamQuestionPayload[];
};

function createSupabaseAdminClient() {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
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
        { error: "Bạn không có quyền quản lý bài tập." },
        { status: 403 },
      ),
    };
  }

  return { account };
}

function formatExamDate(value: string | null) {
  if (!value) return "Chưa đặt hạn";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function mapAssignment(row: AssignmentRow) {
  const submissions = row.submissions ?? [];
  const completed = submissions.filter(
    (submission) =>
      submission.status === "submitted" || submission.status === "graded",
  ).length;
  const participants = submissions.length;

  return {
    id: `EX-${String(row.id).padStart(3, "0")}`,
    title: row.title,
    description:
      participants > 0
        ? completed > 0 && completed === participants
          ? `${completed} học viên đã hoàn thành`
          : `${participants} học viên tham gia`
        : row.description || "Chưa có học viên tham gia",
    week: row.week_number ? `Tuần ${String(row.week_number).padStart(2, "0")}` : "Chưa phân tuần",
    weekValue: row.week_number ? `week-${row.week_number}` : "week-none",
    dueDate: formatExamDate(row.due_date),
    status: row.admin_status,
    participants,
    completed,
    iconTone: row.icon_tone,
  };
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeQuestion(question: ExamQuestionPayload, index: number) {
  const questionType =
    question.type === "essay" ? "essay" : "multiple_choice";
  const prompt = cleanText(question.prompt);
  const options = (question.options ?? [])
    .map((option, optionIndex) => ({
      option_text: cleanText(option.text),
      is_correct: Boolean(option.isCorrect),
      sort_order: optionIndex + 1,
    }))
    .filter((option) => option.option_text);

  return {
    question_type: questionType,
    prompt,
    helper_text: cleanText(question.helperText) || null,
    scripture_reference: cleanText(question.scriptureReference) || null,
    answer_hint: cleanText(question.answerHint) || null,
    allow_multiple:
      questionType === "multiple_choice" ? Boolean(question.allowMultiple) : false,
    sort_order: index + 1,
    is_required: true,
    points: 1,
    options,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize") || "4"), 1),
      50,
    );
    const q = searchParams.get("q")?.trim();
    const week = searchParams.get("week")?.trim();
    const status = searchParams.get("status")?.trim();
    const offset = (page - 1) * pageSize;
    const supabaseAdmin = createSupabaseAdminClient();

    let query = supabaseAdmin
      .from("assignments")
      .select(
        "id,title,description,week_number,due_date,admin_status,icon_tone,submissions(status)",
        { count: "exact" },
      )
      .order("due_date", { ascending: true, nullsFirst: false })
      .range(offset, offset + pageSize - 1);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (week && week !== "all") {
      const weekNumber = Number(week.replace("week-", ""));
      if (Number.isFinite(weekNumber)) {
        query = query.eq("week_number", weekNumber);
      }
    }

    if (status && status !== "all" && validStatuses.has(status)) {
      query = query.eq("admin_status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message || "Không thể tải danh sách bài tập." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      exams: ((data ?? []) as AssignmentRow[]).map(mapAssignment),
      page,
      pageSize,
      total: count ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách bài tập.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const payload = (await request.json().catch(() => ({}))) as CreateExamPayload;
    const action = payload.action === "publish" ? "publish" : "draft";
    const isPublish = action === "publish";
    const title = cleanText(payload.title) || "Bài tập chưa đặt tên";
    const code = cleanText(payload.code) || null;
    const category = cleanText(payload.category) || "Thánh học căn bản";
    const dueDate = cleanText(payload.dueDate) || null;
    const description = cleanText(payload.description) || null;
    const questions = (payload.questions ?? [])
      .map(normalizeQuestion)
      .filter((question) => question.prompt);

    if (isPublish && !cleanText(payload.title)) {
      return NextResponse.json(
        { error: "Vui lòng nhập tiêu đề bài tập trước khi đăng." },
        { status: 400 },
      );
    }

    if (isPublish && questions.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng thêm ít nhất một câu hỏi trước khi đăng." },
        { status: 400 },
      );
    }

    const invalidChoice = questions.find(
      (question) =>
        question.question_type === "multiple_choice" &&
        (question.options.length < 2 ||
          !question.options.some((option) => option.is_correct)),
    );

    if (isPublish && invalidChoice) {
      return NextResponse.json(
        {
          error:
            "Câu trắc nghiệm cần ít nhất 2 đáp án và 1 đáp án đúng trước khi đăng.",
        },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from("assignments")
      .insert({
        title,
        assignment_code: code,
        category,
        description,
        due_date: dueDate,
        created_by: admin.account.user.id,
        admin_status: isPublish ? "ongoing" : "draft",
        icon_tone: isPublish ? "blue" : "gold",
      })
      .select("id,title,admin_status")
      .single();

    if (assignmentError || !assignment) {
      const isDuplicateCode = assignmentError?.code === "23505";

      return NextResponse.json(
        {
          error: isDuplicateCode
            ? "Mã bài tập đã tồn tại. Vui lòng dùng mã khác."
            : assignmentError?.message || "Không thể tạo bài tập.",
        },
        { status: 400 },
      );
    }

    for (const question of questions) {
      const { options, ...questionRow } = question;
      const { data: createdQuestion, error: questionError } = await supabaseAdmin
        .from("assignment_questions")
        .insert({
          ...questionRow,
          assignment_id: assignment.id,
        })
        .select("id")
        .single();

      if (questionError || !createdQuestion) {
        await supabaseAdmin.from("assignments").delete().eq("id", assignment.id);
        return NextResponse.json(
          { error: questionError?.message || "Không thể lưu câu hỏi." },
          { status: 400 },
        );
      }

      if (options.length > 0) {
        const { error: optionError } = await supabaseAdmin
          .from("assignment_question_options")
          .insert(
            options.map((option) => ({
              ...option,
              question_id: createdQuestion.id,
            })),
          );

        if (optionError) {
          await supabaseAdmin.from("assignments").delete().eq("id", assignment.id);
          return NextResponse.json(
            { error: optionError.message || "Không thể lưu đáp án." },
            { status: 400 },
          );
        }
      }
    }

    return NextResponse.json(
      {
        exam: {
          id: `EX-${String(assignment.id).padStart(3, "0")}`,
          title: assignment.title,
          status: assignment.admin_status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tạo bài tập.",
      },
      { status: 500 },
    );
  }
}
