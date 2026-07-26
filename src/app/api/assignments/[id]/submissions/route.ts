import { NextResponse } from "next/server";
import { getAccessToken, getCurrentUser, supabaseDataRequest } from "@/lib/supabase/auth";

type AssignmentSubmissionRouteProps = {
  params: Promise<{ id: string }>;
};

type SubmissionPayload = {
  status?: "draft" | "submitted";
  answers?: Record<string, string | string[]>;
  scriptureRefs?: Record<string, string>;
};

type ExistingSubmission = {
  id: number | string;
};

function rawAssignmentId(id: string) {
  const match = id.match(/\d+/);
  return match ? String(Number(match[0])) : id;
}

function cleanPayload(payload: SubmissionPayload | null): Required<SubmissionPayload> {
  return {
    status: payload?.status === "submitted" ? "submitted" : "draft",
    answers:
      payload?.answers && typeof payload.answers === "object"
        ? payload.answers
        : {},
    scriptureRefs:
      payload?.scriptureRefs && typeof payload.scriptureRefs === "object"
        ? payload.scriptureRefs
        : {},
  };
}

async function writeSubmission({
  submissionId,
  assignmentId,
  userId,
  status,
  answers,
  scriptureRefs,
  accessToken,
  includeAnswerColumns,
}: {
  submissionId?: number | string;
  assignmentId: string;
  userId: string;
  status: "draft" | "submitted";
  answers: Record<string, string | string[]>;
  scriptureRefs: Record<string, string>;
  accessToken: string;
  includeAnswerColumns: boolean;
}) {
  const baseBody = {
    assignment_id: Number(assignmentId),
    user_id: userId,
    status,
  };
  const body = includeAnswerColumns
    ? {
        ...baseBody,
        answers,
        scripture_refs: scriptureRefs,
      }
    : baseBody;

  if (submissionId) {
    return supabaseDataRequest(
      `submissions?id=eq.${encodeURIComponent(String(submissionId))}`,
      accessToken,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(body),
      },
    );
  }

  return supabaseDataRequest("submissions", accessToken, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
}

export async function POST(
  request: Request,
  { params }: AssignmentSubmissionRouteProps,
) {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  if (!user || !accessToken) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const assignmentId = rawAssignmentId(id);
    const payload = cleanPayload(
      (await request.json().catch(() => null)) as SubmissionPayload | null,
    );
    const existing = await supabaseDataRequest<ExistingSubmission[]>(
      `submissions?assignment_id=eq.${encodeURIComponent(assignmentId)}&user_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`,
      accessToken,
    );
    const submissionId = existing[0]?.id;

    try {
      const submission = await writeSubmission({
        submissionId,
        assignmentId,
        userId: user.id,
        status: payload.status,
        answers: payload.answers,
        scriptureRefs: payload.scriptureRefs,
        accessToken,
        includeAnswerColumns: true,
      });

      return NextResponse.json({ submission });
    } catch (writeError) {
      const message =
        writeError instanceof Error ? writeError.message.toLowerCase() : "";

      if (
        !message.includes("answers") &&
        !message.includes("scripture_refs") &&
        !message.includes("column")
      ) {
        throw writeError;
      }

      const submission = await writeSubmission({
        submissionId,
        assignmentId,
        userId: user.id,
        status: payload.status,
        answers: payload.answers,
        scriptureRefs: payload.scriptureRefs,
        accessToken,
        includeAnswerColumns: false,
      });

      return NextResponse.json({
        submission,
        warning:
          "Đã lưu trạng thái bài làm. Database chưa có cột lưu chi tiết câu trả lời.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể lưu bài làm.",
      },
      { status: 500 },
    );
  }
}
