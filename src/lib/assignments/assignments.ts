import {
  assignmentRouteId,
  assignmentStatus,
  type AssignmentAnswer,
  type AssignmentItem,
  type AssignmentQuestion,
  type AssignmentSubmission,
  type SubmissionStatus,
} from "@/com/assignment/assignmentData";
import { supabaseDataRequest } from "@/lib/supabase/auth";

type SubmissionRow = {
  id: number;
  status: SubmissionStatus;
  content: string | null;
  submitted_at: string | null;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
};

type AssignmentRow = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  week_number: number | null;
  attachment_url: string | null;
  due_date: string | null;
  media_asset: { public_url: string | null } | null;
  submissions?: SubmissionRow[];
};

type AssignmentDetailRow = AssignmentRow & {
  assignment_questions?: Array<{
    id: number;
    question_type: "multiple_choice" | "essay";
    prompt: string;
    helper_text: string | null;
    scripture_reference: string | null;
    answer_hint: string | null;
    allow_multiple: boolean;
    is_required: boolean;
    points: number | null;
    sort_order: number;
    // is_correct không được cấp quyền SELECT cho thành viên nên không lấy.
    assignment_question_options?: Array<{ id: number; option_text: string; sort_order: number }>;
  }>;
};

type AnswerRow = {
  question_id: number;
  answer_text: string | null;
  selected_option_ids: number[] | null;
  scripture_ref: string | null;
  is_correct: boolean | null;
  points_awarded: number | null;
  teacher_comment: string | null;
};

const SUBMISSION_FIELDS = "id,status,content,submitted_at,grade,feedback,graded_at";
const ASSIGNMENT_FIELDS =
  "id,title,description,category,week_number,attachment_url,due_date,media_asset:media_asset_id(public_url)";

/** Chỉ lấy bài nộp của chính người xem (ban mục vụ đọc được mọi bài nộp). */
function ownSubmissionFilter(userId: string) {
  return `submissions.user_id=eq.${encodeURIComponent(userId)}`;
}

function toAssignment(row: AssignmentRow): AssignmentItem {
  const submission = row.submissions?.[0] ?? null;
  return {
    id: assignmentRouteId(row.id),
    rawId: row.id,
    title: row.title,
    description: row.description,
    category: row.category || "Chung",
    dueDate: row.due_date,
    weekNumber: row.week_number,
    attachmentUrl: row.media_asset?.public_url || row.attachment_url,
    status: assignmentStatus(row.due_date, submission),
    grade: submission?.status === "graded" && submission.grade != null ? Number(submission.grade) : null,
  };
}

function toSubmission(row: SubmissionRow | undefined): AssignmentSubmission | null {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    content: row.content ?? "",
    submittedAt: row.submitted_at,
    grade: row.grade == null ? null : Number(row.grade),
    feedback: row.feedback,
    gradedAt: row.graded_at,
  };
}

/** Bài tập đã giao cho thành viên (bỏ bản nháp của ban mục vụ), hạn gần nhất trước. */
export async function getMemberAssignments(
  userId: string,
  accessToken: string,
  options: { dueFrom?: string; dueTo?: string } = {},
) {
  const filters = [
    `select=${ASSIGNMENT_FIELDS},submissions(${SUBMISSION_FIELDS})`,
    ownSubmissionFilter(userId),
    "admin_status=neq.draft",
    options.dueFrom ? `due_date=gte.${options.dueFrom}` : null,
    options.dueTo ? `due_date=lte.${options.dueTo}` : null,
    "order=due_date.desc.nullslast,id.desc",
  ].filter(Boolean);

  const rows = await supabaseDataRequest<AssignmentRow[]>(
    `assignments?${filters.join("&")}`,
    accessToken,
  );
  return rows.map(toAssignment);
}

export async function getAssignmentDetail(rawId: number, userId: string, accessToken: string) {
  const rows = await supabaseDataRequest<AssignmentDetailRow[]>(
    `assignments?id=eq.${rawId}&admin_status=neq.draft&select=${ASSIGNMENT_FIELDS},submissions(${SUBMISSION_FIELDS}),assignment_questions(id,question_type,prompt,helper_text,scripture_reference,answer_hint,allow_multiple,is_required,points,sort_order,assignment_question_options(id,option_text,sort_order))&${ownSubmissionFilter(userId)}&limit=1`,
    accessToken,
  );
  const row = rows[0];
  if (!row) return null;

  const questions: AssignmentQuestion[] = (row.assignment_questions ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((question) => ({
      id: question.id,
      type: question.question_type,
      prompt: question.prompt,
      helperText: question.helper_text,
      scriptureReference: question.scripture_reference,
      answerHint: question.answer_hint,
      allowMultiple: question.allow_multiple,
      isRequired: question.is_required,
      points: question.points == null ? null : Number(question.points),
      options: (question.assignment_question_options ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((option) => ({ id: option.id, text: option.option_text })),
    }));

  const submission = toSubmission(row.submissions?.[0]);
  let answers: AssignmentAnswer[] = [];
  if (submission) {
    const answerRows = await supabaseDataRequest<AnswerRow[]>(
      `submission_answers?submission_id=eq.${submission.id}&select=question_id,answer_text,selected_option_ids,scripture_ref,is_correct,points_awarded,teacher_comment`,
      accessToken,
    );
    answers = answerRows.map((answer) => ({
      questionId: answer.question_id,
      answerText: answer.answer_text ?? "",
      selectedOptionIds: (answer.selected_option_ids ?? []).map(Number),
      scriptureRef: answer.scripture_ref ?? "",
      isCorrect: answer.is_correct,
      pointsAwarded: answer.points_awarded == null ? null : Number(answer.points_awarded),
      teacherComment: answer.teacher_comment,
    }));
  }

  return { assignment: toAssignment(row), questions, submission, answers };
}
