import { createClient } from "@supabase/supabase-js";
import { supabaseDataRequest } from "@/lib/supabase/auth";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

export type GradingSubmissionStatus = "draft" | "submitted" | "graded";

export type GradingQuestion = {
  id: number;
  type: "multiple_choice" | "essay";
  prompt: string;
  helperText: string | null;
  points: number;
  allowMultiple: boolean;
  options: Array<{ id: number; text: string; isCorrect: boolean }>;
};

export type GradingAnswer = {
  questionId: number;
  answerText: string | null;
  selectedOptionIds: number[];
  scriptureRef: string | null;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  teacherComment: string | null;
  /** Gợi ý tự chấm cho câu trắc nghiệm (đúng hết đáp án mới tính điểm). */
  autoCorrect: boolean | null;
};

export type GradingSubmission = {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  status: GradingSubmissionStatus;
  content: string | null;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
  questions: GradingQuestion[];
  answers: GradingAnswer[];
};

type QuestionRow = {
  id: number;
  question_type: "multiple_choice" | "essay";
  prompt: string;
  helper_text: string | null;
  points: number | string | null;
  allow_multiple: boolean;
  sort_order: number;
  assignment_question_options?: Array<{
    id: number;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
  }>;
};

type SubmissionRow = {
  id: number;
  assignment_id: number;
  user_id: string;
  status: GradingSubmissionStatus;
  content: string | null;
  submitted_at: string | null;
  grade: number | string | null;
  feedback: string | null;
  graded_at: string | null;
  assignment: { title: string } | null;
  profile: { name: string | null; email: string | null } | null;
  submission_answers?: Array<{
    question_id: number;
    answer_text: string | null;
    selected_option_ids: number[] | null;
    scripture_ref: string | null;
    is_correct: boolean | null;
    points_awarded: number | string | null;
    teacher_comment: string | null;
  }>;
};

const toNumber = (value: number | string | null | undefined) =>
  value == null || value === "" ? null : Number(value);

/**
 * Đọc bài nộp bằng service role vì cột is_correct của đáp án bị chặn SELECT với
 * authenticated. Quyền ban mục vụ đã được kiểm tra trước khi gọi hàm này.
 */
function serviceClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function sameIds(first: number[], second: number[]) {
  if (first.length !== second.length) return false;
  const set = new Set(first);
  return second.every((id) => set.has(id));
}

export async function getGradingSubmission(
  assignmentId: string,
  submissionId: string,
): Promise<GradingSubmission | null> {
  const supabase = serviceClient();
  const [submissionResult, questionResult] = await Promise.all([
    supabase
      .from("submissions")
      .select(
        "id,assignment_id,user_id,status,content,submitted_at,grade,feedback,graded_at,assignment:assignment_id(title),profile:user_id(name,email),submission_answers(question_id,answer_text,selected_option_ids,scripture_ref,is_correct,points_awarded,teacher_comment)",
      )
      .eq("id", submissionId)
      .eq("assignment_id", assignmentId)
      .maybeSingle(),
    supabase
      .from("assignment_questions")
      .select(
        "id,question_type,prompt,helper_text,points,allow_multiple,sort_order,assignment_question_options(id,option_text,is_correct,sort_order)",
      )
      .eq("assignment_id", assignmentId)
      .order("sort_order"),
  ]);

  if (submissionResult.error) throw new Error(submissionResult.error.message);
  if (questionResult.error) throw new Error(questionResult.error.message);
  const row = submissionResult.data as unknown as SubmissionRow | null;
  if (!row) return null;

  const questions: GradingQuestion[] = ((questionResult.data ?? []) as QuestionRow[]).map((question) => ({
    id: question.id,
    type: question.question_type,
    prompt: question.prompt,
    helperText: question.helper_text,
    points: toNumber(question.points) ?? 1,
    allowMultiple: question.allow_multiple,
    options: (question.assignment_question_options ?? [])
      .slice()
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((option) => ({ id: option.id, text: option.option_text, isCorrect: option.is_correct })),
  }));
  const questionById = new Map(questions.map((question) => [question.id, question]));

  const answers: GradingAnswer[] = (row.submission_answers ?? []).map((answer) => {
    const question = questionById.get(answer.question_id);
    const selected = (answer.selected_option_ids ?? []).map(Number);
    const correctIds = question?.options.filter((option) => option.isCorrect).map((option) => option.id) ?? [];
    return {
      questionId: answer.question_id,
      answerText: answer.answer_text,
      selectedOptionIds: selected,
      scriptureRef: answer.scripture_ref,
      isCorrect: answer.is_correct,
      pointsAwarded: toNumber(answer.points_awarded),
      teacherComment: answer.teacher_comment,
      autoCorrect:
        question?.type === "multiple_choice" && correctIds.length ? sameIds(selected, correctIds) : null,
    };
  });

  return {
    id: row.id,
    assignmentId: row.assignment_id,
    assignmentTitle: row.assignment?.title ?? "Bài tập",
    userId: row.user_id,
    studentName: row.profile?.name || row.profile?.email || "Học viên",
    studentEmail: row.profile?.email || "",
    status: row.status,
    content: row.content,
    submittedAt: row.submitted_at,
    grade: toNumber(row.grade),
    feedback: row.feedback,
    gradedAt: row.graded_at,
    questions,
    answers,
  };
}

export type GradeInput = {
  grade: number | null;
  feedback: string | null;
  status: "graded" | "submitted";
  answers: Array<{
    questionId: number;
    pointsAwarded: number | null;
    isCorrect: boolean | null;
    teacherComment: string | null;
  }>;
};

function readNumber(value: unknown, label: string, max?: number) {
  if (value == null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < 0 || (max != null && number > max)) {
    throw new Error(max != null ? `${label} phải từ 0 đến ${max}.` : `${label} không hợp lệ.`);
  }
  return Math.round(number * 100) / 100;
}

function readText(value: unknown, max: number, label: string) {
  if (value == null) return null;
  if (typeof value !== "string") throw new Error(`${label} không hợp lệ.`);
  const text = value.trim();
  if (text.length > max) throw new Error(`${label} tối đa ${max} ký tự.`);
  return text || null;
}

export function parseGradeInput(body: Record<string, unknown>, questions: GradingQuestion[]): GradeInput {
  const status = body.status === "submitted" ? "submitted" : "graded";
  const grade = readNumber(body.grade, "Điểm", 10);
  if (status === "graded" && grade == null) throw new Error("Vui lòng nhập điểm (thang 10).");

  const questionById = new Map(questions.map((question) => [question.id, question]));
  const rawAnswers = Array.isArray(body.answers) ? body.answers : [];
  if (rawAnswers.length > 200) throw new Error("Quá nhiều câu trả lời.");

  const answers = rawAnswers.map((raw) => {
    const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const questionId = Number(item.questionId);
    const question = questionById.get(questionId);
    if (!question) throw new Error("Câu hỏi không thuộc bài tập này.");
    return {
      questionId,
      pointsAwarded: readNumber(item.pointsAwarded, `Điểm câu "${question.prompt.slice(0, 40)}"`, question.points),
      isCorrect: typeof item.isCorrect === "boolean" ? item.isCorrect : null,
      teacherComment: readText(item.teacherComment, 2000, "Nhận xét từng câu"),
    };
  });

  return { grade, feedback: readText(body.feedback, 4000, "Nhận xét"), status, answers };
}

/**
 * Ghi điểm bằng token của người chấm: RLS is_staff() cho phép, và trigger
 * guard_submission_grading tự điền graded_by / graded_at.
 */
export async function saveGrade(accessToken: string, submissionId: number, input: GradeInput) {
  if (input.answers.length) {
    await supabaseDataRequest(
      "submission_answers?on_conflict=submission_id,question_id",
      accessToken,
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(
          input.answers.map((answer) => ({
            submission_id: submissionId,
            question_id: answer.questionId,
            points_awarded: answer.pointsAwarded,
            is_correct: answer.isCorrect,
            teacher_comment: answer.teacherComment,
          })),
        ),
      },
    );
  }

  const patch =
    input.status === "graded"
      ? // graded_at / graded_by để trống: trigger điền lại thời điểm và người chấm lần này.
        { status: "graded", grade: input.grade, feedback: input.feedback, graded_at: null, graded_by: null }
      : // Trả bài về "đã nộp": xoá điểm để thành viên không thấy kết quả cũ.
        { status: "submitted", grade: null, feedback: input.feedback, graded_at: null, graded_by: null };

  const rows = await supabaseDataRequest<Array<{ id: number }>>(
    `submissions?id=eq.${submissionId}&select=id`,
    accessToken,
    { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) },
  );
  if (!rows.length) throw new Error("Không cập nhật được bài nộp (có thể bạn không có quyền).");
}
