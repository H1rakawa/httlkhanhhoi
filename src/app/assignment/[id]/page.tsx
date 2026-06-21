import { notFound, redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentWorkClient from "@/com/assignment/AssignmentWorkClient";
import {
  AssignmentItem,
  AssignmentStatus,
  assignmentRawId,
  assignmentRouteId,
  categoryFromWeek,
  fallbackAssignments,
} from "@/com/assignment/assignmentData";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import {
  getAccessToken,
  getCurrentUser,
  supabaseDataRequest,
} from "@/lib/supabase/auth";

type AssignmentWorkPageProps = {
  params: Promise<{ id: string }>;
};

type ApiAssignment = {
  id: number;
  title: string;
  description: string | null;
  week_number: number | null;
  attachment_url: string | null;
  due_date: string | null;
  media_asset:
    | {
        public_url: string;
        media_kind: string;
        mime_type: string;
        size_bytes: number;
      }
    | null;
  submissions?: Array<{
    status: "draft" | "submitted" | "graded";
    grade: number | null;
  }>;
};

function statusFromApi(assignment: ApiAssignment): AssignmentStatus {
  const submission = assignment.submissions?.[0];
  if (submission?.status === "graded") return "Đã chấm";
  if (submission?.status === "submitted") return "Đã nộp";
  if (submission?.status === "draft") return "Đang thực hiện";
  if (assignment.due_date && new Date(`${assignment.due_date}T23:59:59`) < new Date()) {
    return "Trễ hạn";
  }
  return "Chưa bắt đầu";
}

export function generateStaticParams() {
  return fallbackAssignments.map((assignment) => ({ id: assignment.id }));
}

async function getAssignment(id: string) {
  const fallback = fallbackAssignments.find(
    (assignment) => assignment.id === id || assignmentRawId(assignment.id) === id,
  );
  if (fallback) return fallback;

  try {
    const rawId = assignmentRawId(id);
    const assignments = await supabaseDataRequest<ApiAssignment[]>(
      `assignments?id=eq.${encodeURIComponent(rawId)}&select=id,title,description,week_number,attachment_url,due_date,media_asset:media_asset_id(public_url,media_kind,mime_type,size_bytes),submissions(status,grade)&limit=1`,
      await getAccessToken(),
    );
    const assignment = assignments[0];
    if (!assignment) return null;

    return {
      id: assignmentRouteId(assignment.id),
      title: assignment.title,
      description: assignment.description || "Bài tập học tập và rèn luyện.",
      category: categoryFromWeek(assignment.week_number),
      dueDate: assignment.due_date || new Date().toISOString().slice(0, 10),
      weekNumber: assignment.week_number,
      attachmentUrl: assignment.media_asset?.public_url || assignment.attachment_url,
      status: statusFromApi(assignment),
      grade: assignment.submissions?.[0]?.grade,
    } satisfies AssignmentItem;
  } catch {
    return null;
  }
}

export default async function AssignmentWorkPage({
  params,
}: AssignmentWorkPageProps) {
  if (!(await getCurrentUser())) redirect("/auth");

  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <AssignmentBackdrop />
      <Header activePath="/assignment" />
      <AssignmentWorkClient assignment={assignment} />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
