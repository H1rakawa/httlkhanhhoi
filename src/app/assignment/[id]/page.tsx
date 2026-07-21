import { notFound, redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentWorkClient from "@/com/assignment/AssignmentWorkClient";
import {
  AssignmentItem,
  AssignmentQuestion,
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
  category: string | null;
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
  assignment_questions?: Array<{
    id: number;
    question_type: "multiple_choice" | "essay";
    prompt: string;
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

function mapQuestions(assignment: ApiAssignment): AssignmentQuestion[] {
  return (assignment.assignment_questions ?? [])
    .slice()
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((question) => ({
      id: `db-${question.id}`,
      type: question.question_type === "essay" ? "textarea" : "choice",
      title: question.prompt,
      options:
        question.question_type === "multiple_choice"
          ? (question.assignment_question_options ?? [])
              .slice()
              .sort((first, second) => first.sort_order - second.sort_order)
              .map((option) => option.option_text)
          : undefined,
      allowMultiple: question.allow_multiple,
      scriptureReference: question.scripture_reference,
      answerHint: question.answer_hint,
      placeholder:
        question.question_type === "essay"
          ? "Viết câu trả lời của bạn tại đây..."
          : undefined,
    }));
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
      `assignments?id=eq.${encodeURIComponent(rawId)}&select=id,title,description,category,week_number,attachment_url,due_date,media_asset:media_asset_id(public_url,media_kind,mime_type,size_bytes),submissions(status,grade),assignment_questions(id,question_type,prompt,scripture_reference,answer_hint,allow_multiple,sort_order,assignment_question_options(option_text,is_correct,sort_order))&limit=1`,
      await getAccessToken(),
    );
    const assignment = assignments[0];
    if (!assignment) return null;

    return {
      id: assignmentRouteId(assignment.id),
      title: assignment.title,
      description: assignment.description || "Bài tập học tập và rèn luyện.",
      category: assignment.category || categoryFromWeek(assignment.week_number),
      dueDate: assignment.due_date || new Date().toISOString().slice(0, 10),
      weekNumber: assignment.week_number,
      attachmentUrl: assignment.media_asset?.public_url || assignment.attachment_url,
      status: statusFromApi(assignment),
      grade: assignment.submissions?.[0]?.grade,
      questions: mapQuestions(assignment),
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
