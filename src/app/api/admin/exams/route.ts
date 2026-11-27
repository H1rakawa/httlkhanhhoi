import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/admin/staff";
import {
  assignmentWriteError,
  cleanText,
  createSupabaseAdminClient,
  formatExamCode,
  insertQuestions,
  normalizeCategory,
  normalizeQuestions,
  publishError,
  type ExamPayload,
} from "@/lib/admin/exams";

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

function requireAdmin() {
  return requireStaffApi("Bạn không có quyền quản lý bài tập.");
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
    id: formatExamCode(row.id),
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

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const { searchParams } = new URL(request.url);
    const supabaseAdmin = createSupabaseAdminClient();

    if (searchParams.get("stats") === "1") {
      const { count, error } = await supabaseAdmin
        .from("assignments")
        .select("id", { count: "exact", head: true });

      if (error) {
        return NextResponse.json(
          { error: error.message || "Không thể tải thống kê bài tập." },
          { status: 400 },
        );
      }

      return NextResponse.json({
        assignments: count ?? 0,
      });
    }

    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize") || "4"), 1),
      50,
    );
    const q = searchParams.get("q")?.trim();
    const week = searchParams.get("week")?.trim();
    const status = searchParams.get("status")?.trim();
    const offset = (page - 1) * pageSize;

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

    const payload = (await request.json().catch(() => ({}))) as ExamPayload;
    const isPublish = payload.action === "publish";
    const questions = normalizeQuestions(payload);

    if (isPublish) {
      const message = publishError(cleanText(payload.title), questions);
      if (message) return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from("assignments")
      .insert({
        title: cleanText(payload.title) || "Bài tập chưa đặt tên",
        assignment_code: cleanText(payload.code) || null,
        category: normalizeCategory(payload.category),
        description: cleanText(payload.description) || null,
        due_date: cleanText(payload.dueDate) || null,
        created_by: admin.account.user.id,
        admin_status: isPublish ? "ongoing" : "draft",
        icon_tone: isPublish ? "blue" : "gold",
      })
      .select("id,title,admin_status")
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: assignmentWriteError(assignmentError, "Không thể tạo bài tập.") },
        { status: 400 },
      );
    }

    const questionError = await insertQuestions(supabaseAdmin, assignment.id, questions);
    if (questionError) {
      await supabaseAdmin.from("assignments").delete().eq("id", assignment.id);
      return NextResponse.json({ error: questionError }, { status: 400 });
    }

    return NextResponse.json(
      {
        exam: {
          id: formatExamCode(assignment.id),
          title: assignment.title,
          status: assignment.admin_status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể tạo bài tập." },
      { status: 500 },
    );
  }
}
