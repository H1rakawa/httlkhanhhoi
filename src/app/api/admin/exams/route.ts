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
