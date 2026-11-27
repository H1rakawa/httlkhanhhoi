import { NextResponse } from "next/server";
import { assignmentRawId, type SubmissionStatus } from "@/com/assignment/assignmentData";
import { getAccessToken, getCurrentUser, supabaseDataRequest } from "@/lib/supabase/auth";

type RouteProps = { params: Promise<{ id: string }> };

type AnswerPayload = {
  questionId?: unknown;
  answerText?: unknown;
  selectedOptionIds?: unknown;
  scriptureRef?: unknown;
};

type SubmissionPayload = {
  status?: unknown;
  content?: unknown;
  answers?: unknown;
};

type QuestionRow = {
  id: number;
  question_type: "multiple_choice" | "essay";
  allow_multiple: boolean;
  is_required: boolean;
  assignment_question_options?: Array<{ id: number }>;
};

const MAX_TEXT = 5000;

function text(value: unknown, max = MAX_TEXT) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function json(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/**
 * Lưu nháp hoặc nộp bài. Câu trả lời từng câu nằm ở submission_answers;
 * bài không có câu hỏi thì lưu bài làm vào submissions.content.
 * Thành viên chỉ sửa được khi bài còn ở trạng thái nháp (RLS + trigger).
 */
export async function POST(request: Request, { params }: RouteProps) {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  if (!accessToken || !user) return json("Chưa đăng nhập.", 401);

  const assignmentId = assignmentRawId((await params).id);
  if (!assignmentId) return json("Không tìm thấy bài tập.", 404);

  const payload = (await request.json().catch(() => null)) as SubmissionPayload | null;
  const nextStatus: SubmissionStatus = payload?.status === "submitted" ? "submitted" : "draft";
  const content = text(payload?.content);
  const rawAnswers = Array.isArray(payload?.answers) ? (payload.answers as AnswerPayload[]) : [];

  try {
    const assignments = await supabaseDataRequest<
      Array<{ id: number; assignment_questions: QuestionRow[] }>
    >(
      `assignments?id=eq.${assignmentId}&admin_status=neq.draft&select=id,assignment_questions(id,question_type,allow_multiple,is_required,assignment_question_options(id))&limit=1`,
      accessToken,
    );
    const assignment = assignments[0];
    if (!assignment) return json("Không tìm thấy bài tập.", 404);

    const questions = new Map(assignment.assignment_questions.map((q) => [q.id, q]));
    const answers = rawAnswers
      .map((answer) => {
        const question = questions.get(Number(answer.questionId));
        if (!question) return null;
        const validOptions = new Set((question.assignment_question_options ?? []).map((o) => o.id));
        let selected = Array.isArray(answer.selectedOptionIds)
          ? [...new Set(answer.selectedOptionIds.map(Number))].filter((id) => validOptions.has(id))
          : [];
        if (!question.allow_multiple) selected = selected.slice(0, 1);
        return {
          question_id: question.id,
          answer_text: question.question_type === "essay" ? text(answer.answerText) || null : null,
          selected_option_ids: question.question_type === "multiple_choice" ? selected : [],
          scripture_ref: text(answer.scriptureRef, 300) || null,
        };
      })
      .filter((answer): answer is NonNullable<typeof answer> => answer !== null);

    if (nextStatus === "submitted") {
      if (questions.size === 0 && !content) {
        return json("Vui lòng nhập bài làm trước khi nộp.", 400);
      }
      const missing = assignment.assignment_questions.filter((question) => {
        if (!question.is_required) return false;
        const answer = answers.find((item) => item.question_id === question.id);
        return !answer || (!answer.answer_text && answer.selected_option_ids.length === 0);
      });
      if (missing.length) {
        return json(`Còn ${missing.length} câu bắt buộc chưa trả lời.`, 400);
      }
    }

    const existing = await supabaseDataRequest<Array<{ id: number; status: SubmissionStatus }>>(
      `submissions?assignment_id=eq.${assignmentId}&user_id=eq.${user.id}&select=id,status&limit=1`,
      accessToken,
    );
    let submission = existing[0];
    if (submission && submission.status !== "draft") {
      return json("Bài đã nộp nên không sửa được nữa.", 409);
    }

    if (submission) {
      await supabaseDataRequest(`submissions?id=eq.${submission.id}`, accessToken, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ content: content || null }),
      });
    } else {
      const created = await supabaseDataRequest<Array<{ id: number; status: SubmissionStatus }>>(
        "submissions",
        accessToken,
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            assignment_id: assignmentId,
            user_id: user.id,
            status: "draft",
            content: content || null,
          }),
        },
      );
      submission = created[0];
    }

    if (answers.length) {
      await supabaseDataRequest(
        "submission_answers?on_conflict=submission_id,question_id",
        accessToken,
        {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(answers.map((answer) => ({ ...answer, submission_id: submission.id }))),
        },
      );
    }

    if (nextStatus === "submitted") {
      // Trigger guard_submission_grading tự ghi submitted_at.
      await supabaseDataRequest(`submissions?id=eq.${submission.id}`, accessToken, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "submitted" }),
      });
    }

    return NextResponse.json({ ok: true, status: nextStatus, submissionId: submission.id });
  } catch (error) {
    return json(
      error instanceof Error && error.message ? error.message : "Không thể lưu bài làm.",
      500,
    );
  }
}
