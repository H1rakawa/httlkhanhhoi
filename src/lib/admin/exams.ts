import { createClient } from "@supabase/supabase-js";
import {
  ASSIGNMENT_CATEGORIES,
  ASSIGNMENT_DEFAULT_CATEGORY,
  type AdminExamStatus,
} from "@/com/admin/exam/adminExamData";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

/**
 * Bài tập được ghi bằng service role (cột is_correct của đáp án bị chặn với
 * authenticated). Mọi route gọi tới đây đã kiểm tra quyền ban mục vụ trước.
 */
export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>;

export const EXAM_STATUSES: AdminExamStatus[] = ["ongoing", "upcoming", "ended", "draft"];

export function isExamStatus(value: unknown): value is AdminExamStatus {
  return typeof value === "string" && (EXAM_STATUSES as string[]).includes(value);
}

/** "EX-007" hoặc "7" → "7"; không hợp lệ → null. */
export function rawAssignmentId(id: string) {
  const digits = id.match(/\d+/)?.[0];
  return digits ? String(Number(digits)) : null;
}

export function formatExamCode(id: number | string) {
  return `EX-${String(id).padStart(3, "0")}`;
}

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCategory(value: unknown) {
  const requested = cleanText(value);
  return (ASSIGNMENT_CATEGORIES as readonly string[]).includes(requested)
    ? requested
    : ASSIGNMENT_DEFAULT_CATEGORY;
}

export type ExamQuestionPayload = {
  type?: string;
  prompt?: string;
  helperText?: string;
  scriptureReference?: string;
  answerHint?: string;
  allowMultiple?: boolean;
  options?: Array<{ text?: string; isCorrect?: boolean }>;
};

export type ExamPayload = {
  action?: "draft" | "publish";
  title?: string;
  code?: string;
  category?: string;
  /** YYYY-MM-DD, rỗng = không đặt hạn. */
  dueDate?: string;
  description?: string;
  /** File đã tải lên media_assets, hoặc đường dẫn ngoài (Google Drive…). */
  mediaAssetId?: string | null;
  attachmentUrl?: string | null;
  questions?: ExamQuestionPayload[];
};

export type NormalizedQuestion = ReturnType<typeof normalizeQuestion>;

export function normalizeQuestion(question: ExamQuestionPayload, index: number) {
  const questionType = question.type === "essay" ? "essay" : "multiple_choice";
  const options = (question.options ?? [])
    .map((option, optionIndex) => ({
      option_text: cleanText(option.text),
      is_correct: Boolean(option.isCorrect),
      sort_order: optionIndex + 1,
    }))
    .filter((option) => option.option_text);

  return {
    question_type: questionType,
    prompt: cleanText(question.prompt),
    helper_text: cleanText(question.helperText) || null,
    scripture_reference: cleanText(question.scriptureReference) || null,
    answer_hint: cleanText(question.answerHint) || null,
    allow_multiple: questionType === "multiple_choice" ? Boolean(question.allowMultiple) : false,
    sort_order: index + 1,
    is_required: true,
    points: 1,
    options,
  };
}

export function normalizeQuestions(payload: ExamPayload) {
  return (payload.questions ?? []).map(normalizeQuestion).filter((question) => question.prompt);
}

/** Lỗi chặn đăng bài (bài nháp thì cho lưu thiếu). */
export function publishError(title: string, questions: NormalizedQuestion[]) {
  if (!title) return "Vui lòng nhập tiêu đề bài tập trước khi đăng.";
  if (questions.length === 0) return "Vui lòng thêm ít nhất một câu hỏi trước khi đăng.";
  const invalidChoice = questions.some(
    (question) =>
      question.question_type === "multiple_choice" &&
      (question.options.length < 2 || !question.options.some((option) => option.is_correct)),
  );
  return invalidChoice
    ? "Câu trắc nghiệm cần ít nhất 2 đáp án và 1 đáp án đúng trước khi đăng."
    : null;
}

/** Hạn nộp dạng YYYY-MM-DD hợp lệ, rỗng → null, sai → lỗi. */
export function parseDueDate(value: unknown) {
  const text = cleanText(value);
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
    throw new Error("Hạn nộp không hợp lệ.");
  }
  return text;
}

/** File đính kèm: ưu tiên file đã tải lên, không có thì đường dẫn http(s). */
export function parseAttachment(payload: ExamPayload) {
  const assetId = cleanText(payload.mediaAssetId);
  if (assetId) {
    if (!/^[0-9a-f-]{36}$/i.test(assetId)) throw new Error("Mã file đính kèm không hợp lệ.");
    return { media_asset_id: assetId, attachment_url: null };
  }
  const url = cleanText(payload.attachmentUrl);
  if (!url) return { media_asset_id: null, attachment_url: null };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
    return { media_asset_id: null, attachment_url: parsed.toString() };
  } catch {
    throw new Error("Đường dẫn file đính kèm phải bắt đầu bằng http(s)://");
  }
}

export function assignmentWriteError(error: { code?: string; message?: string } | null, fallback: string) {
  return error?.code === "23505"
    ? "Mã bài tập đã tồn tại. Vui lòng dùng mã khác."
    : error?.message || fallback;
}

/** Ghi lần lượt câu hỏi và đáp án; lỗi thì trả thông báo để route xử lý. */
export async function insertQuestions(
  supabase: SupabaseAdmin,
  assignmentId: number,
  questions: NormalizedQuestion[],
) {
  for (const question of questions) {
    const { options, ...questionRow } = question;
    const { data: created, error: questionError } = await supabase
      .from("assignment_questions")
      .insert({ ...questionRow, assignment_id: assignmentId })
      .select("id")
      .single();

    if (questionError || !created) return questionError?.message || "Không thể lưu câu hỏi.";

    if (options.length > 0) {
      const { error: optionError } = await supabase
        .from("assignment_question_options")
        .insert(options.map((option) => ({ ...option, question_id: created.id })));
      if (optionError) return optionError.message || "Không thể lưu đáp án.";
    }
  }
  return null;
}

/** Số bài nộp của một bài tập: đã có học viên làm thì không sửa câu hỏi / không xoá được. */
export async function countSubmissions(supabase: SupabaseAdmin, assignmentId: string) {
  const [all, finished] = await Promise.all([
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("assignment_id", assignmentId),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("assignment_id", assignmentId)
      .in("status", ["submitted", "graded"]),
  ]);
  return { total: all.count ?? 0, finished: finished.count ?? 0 };
}

type QuestionCopyRow = Omit<NormalizedQuestion, "options"> & {
  assignment_question_options?: Array<{ option_text: string; is_correct: boolean; sort_order: number }>;
};

/** Nhân bản bài tập (thông tin + câu hỏi + đáp án) thành bản nháp mới. */
export async function duplicateAssignment(supabase: SupabaseAdmin, assignmentId: string, userId: string) {
  const { data: source, error } = await supabase
    .from("assignments")
    .select(
      "id,title,description,category,week_number,attachment_url,media_asset_id,assignment_questions(question_type,prompt,helper_text,scripture_reference,answer_hint,allow_multiple,sort_order,is_required,points,assignment_question_options(option_text,is_correct,sort_order))",
    )
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!source) return null;

  const { data: copy, error: copyError } = await supabase
    .from("assignments")
    .insert({
      title: `${source.title} (bản sao)`,
      description: source.description,
      category: source.category,
      week_number: source.week_number,
      attachment_url: source.attachment_url,
      media_asset_id: source.media_asset_id,
      created_by: userId,
      admin_status: "draft",
      icon_tone: "gold",
    })
    .select("id,title,admin_status")
    .single();

  if (copyError || !copy) throw new Error(assignmentWriteError(copyError, "Không thể nhân bản bài tập."));

  const questions = ((source.assignment_questions ?? []) as QuestionCopyRow[])
    .slice()
    .sort((first, second) => first.sort_order - second.sort_order)
    .map(({ assignment_question_options: options = [], ...question }) => ({
      ...question,
      options: options
        .slice()
        .sort((first, second) => first.sort_order - second.sort_order)
        .map(({ option_text, is_correct, sort_order }) => ({ option_text, is_correct, sort_order })),
    }));

  const questionError = await insertQuestions(supabase, copy.id, questions);
  if (questionError) {
    await supabase.from("assignments").delete().eq("id", copy.id);
    throw new Error(questionError);
  }
  return copy;
}

export type EditableAttachment = {
  mediaAssetId: string | null;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type EditableExam = {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  dueDate: string;
  attachment: EditableAttachment | null;
  status: AdminExamStatus;
  submissionCount: number;
  questions: Array<{
    type: "multiple_choice" | "essay";
    prompt: string;
    helperText: string;
    scriptureReference: string;
    allowMultiple: boolean;
    options: Array<{ text: string; isCorrect: boolean }>;
  }>;
};

type EditableRow = {
  id: number;
  title: string;
  assignment_code: string | null;
  category: string | null;
  description: string | null;
  admin_status: AdminExamStatus;
  due_date: string | null;
  attachment_url: string | null;
  media_asset_id: string | null;
  media_asset: { public_url: string | null; file_name: string | null; mime_type: string | null; size_bytes: number | null } | null;
  assignment_questions?: Array<{
    question_type: "multiple_choice" | "essay";
    prompt: string;
    helper_text: string | null;
    scripture_reference: string | null;
    allow_multiple: boolean;
    sort_order: number;
    assignment_question_options?: Array<{ option_text: string; is_correct: boolean; sort_order: number }>;
  }>;
};

/** Dữ liệu nạp sẵn cho trang /admin/assignment/[id]/edit. */
export async function getEditableExam(rawId: string): Promise<EditableExam | null> {
  const assignmentId = rawAssignmentId(rawId);
  if (!assignmentId) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id,title,assignment_code,category,description,admin_status,due_date,attachment_url,media_asset_id,media_asset:media_asset_id(public_url,file_name,mime_type,size_bytes),assignment_questions(question_type,prompt,helper_text,scripture_reference,allow_multiple,sort_order,assignment_question_options(option_text,is_correct,sort_order))",
    )
    .eq("id", assignmentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as EditableRow;
  const { total } = await countSubmissions(supabase, assignmentId);
  return {
    id: formatExamCode(row.id),
    title: row.title,
    code: row.assignment_code ?? "",
    category: normalizeCategory(row.category),
    description: row.description ?? "",
    dueDate: row.due_date ?? "",
    attachment: row.media_asset_id && row.media_asset?.public_url
      ? {
          mediaAssetId: row.media_asset_id,
          url: row.media_asset.public_url,
          fileName: row.media_asset.file_name,
          mimeType: row.media_asset.mime_type,
          sizeBytes: row.media_asset.size_bytes,
        }
      : row.attachment_url
        ? { mediaAssetId: null, url: row.attachment_url, fileName: null, mimeType: null, sizeBytes: null }
        : null,
    status: row.admin_status,
    submissionCount: total,
    questions: (row.assignment_questions ?? [])
      .slice()
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((question) => ({
        type: question.question_type,
        prompt: question.prompt,
        helperText: question.helper_text ?? "",
        scriptureReference: question.scripture_reference ?? "",
        allowMultiple: question.allow_multiple,
        options: (question.assignment_question_options ?? [])
          .slice()
          .sort((first, second) => first.sort_order - second.sort_order)
          .map((option) => ({ text: option.option_text, isCorrect: option.is_correct })),
      })),
  };
}
