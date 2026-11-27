export type AssignmentStatus =
  | "Chưa bắt đầu"
  | "Đang thực hiện"
  | "Đã nộp"
  | "Đã chấm"
  | "Trễ hạn";

export type SubmissionStatus = "draft" | "submitted" | "graded";

export type AssignmentItem = {
  /** Mã hiển thị: mã bài tập ban mục vụ nhập, chưa nhập thì dạng HW-001. Dùng luôn làm đường dẫn. */
  id: string;
  rawId: number;
  title: string;
  description: string | null;
  category: string;
  dueDate: string | null;
  weekNumber: number | null;
  attachmentUrl: string | null;
  status: AssignmentStatus;
  grade: number | null;
};

export type AssignmentOption = { id: number; text: string };

export type AssignmentQuestion = {
  id: number;
  type: "multiple_choice" | "essay";
  prompt: string;
  helperText: string | null;
  scriptureReference: string | null;
  answerHint: string | null;
  allowMultiple: boolean;
  isRequired: boolean;
  points: number | null;
  options: AssignmentOption[];
};

export type AssignmentAnswer = {
  questionId: number;
  answerText: string;
  selectedOptionIds: number[];
  scriptureRef: string;
  /** Chỉ có sau khi giáo viên chấm. */
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  teacherComment: string | null;
};

export type AssignmentSubmission = {
  id: number;
  status: SubmissionStatus;
  content: string;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
};

export const assignmentStatuses = [
  "Tất cả trạng thái",
  "Chưa bắt đầu",
  "Đang thực hiện",
  "Đã nộp",
  "Đã chấm",
  "Trễ hạn",
] as const;

export function assignmentStatus(
  dueDate: string | null,
  submission: { status: SubmissionStatus } | null | undefined,
): AssignmentStatus {
  if (submission?.status === "graded") return "Đã chấm";
  if (submission?.status === "submitted") return "Đã nộp";
  if (isPastDue(dueDate)) return "Trễ hạn";
  if (submission?.status === "draft") return "Đang thực hiện";
  return "Chưa bắt đầu";
}

/** Hạn nộp tính hết ngày theo giờ Việt Nam. */
export function isPastDue(dueDate: string | null, now = Date.now()) {
  if (!dueDate) return false;
  return new Date(`${dueDate}T23:59:59+07:00`).getTime() < now;
}

/** Ngày theo giờ Việt Nam (YYYY-MM-DD), lệch offsetDays ngày so với hôm nay. */
export function vietnamDateKey(offsetDays = 0, now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(now + offsetDays * 86400000),
  );
}

export function formatDueDate(dueDate: string | null) {
  if (!dueDate) return "Không có hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${dueDate}T12:00:00+07:00`));
}

/** Mã dự phòng theo id (HW-009), dùng khi bài chưa có mã nhập tay; đường dẫn cũ vẫn mở được. */
export function assignmentRouteId(id: string | number) {
  const raw = String(id);
  return raw.startsWith("HW-") ? raw : `HW-${raw.padStart(3, "0")}`;
}

/** Id số từ tham số API (/api/assignments/9/...). */
export function assignmentRawId(id: string) {
  const match = id.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function assignmentCode(rawId: number, code: string | null | undefined) {
  return code?.trim() || assignmentRouteId(rawId);
}

/** Đường dẫn trang làm bài / kết quả theo mã hiển thị. */
export function assignmentHref(assignment: { id: string }, result = false) {
  return `/assignment/${encodeURIComponent(assignment.id)}${result ? "/result" : ""}`;
}

export function statusClasses(status: AssignmentStatus) {
  if (status === "Đã chấm") return "bg-[#e5f7ec] text-[#14743a]";
  if (status === "Đã nộp") return "bg-[#eaf3ff] text-[#0066cc]";
  if (status === "Đang thực hiện") return "bg-[#fff2cf] text-[#855c00]";
  if (status === "Trễ hạn") return "bg-[#ffe9e7] text-[#b42318]";
  return "bg-white/66 text-[#6e6e73]";
}
