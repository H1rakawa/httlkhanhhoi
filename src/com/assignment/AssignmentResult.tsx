import Link from "next/link";
import {
  assignmentRouteId,
  statusClasses,
  type AssignmentAnswer,
  type AssignmentItem,
  type AssignmentQuestion,
  type AssignmentSubmission,
} from "@/com/assignment/assignmentData";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type AssignmentResultProps = {
  assignment: AssignmentItem;
  questions: AssignmentQuestion[];
  submission: AssignmentSubmission;
  answers: AssignmentAnswer[];
  answerKey: Map<number, number[]>;
};

type Verdict = "correct" | "incorrect" | "pending" | "none";

const verdictStyles: Record<Verdict, { label: string; className: string }> = {
  correct: { label: "Đúng", className: "bg-[#e5f7ec] text-[#14743a]" },
  incorrect: { label: "Chưa đúng", className: "bg-[#fff1f0] text-[#b42318]" },
  pending: { label: "Chờ chấm", className: "bg-[#eaf3ff] text-[#0066cc]" },
  none: { label: "Chưa trả lời", className: "bg-[#eef0f4] text-[#5b6472]" },
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function sameSet(a: number[], b: number[]) {
  return a.length === b.length && a.every((value) => b.includes(value));
}

function verdictFor(
  question: AssignmentQuestion,
  answer: AssignmentAnswer | undefined,
  correctIds: number[] | undefined,
  graded: boolean,
): Verdict {
  const answered =
    !!answer && (answer.answerText.trim() !== "" || answer.selectedOptionIds.length > 0);
  if (!answered) return "none";
  if (answer.isCorrect != null) return answer.isCorrect ? "correct" : "incorrect";
  if (graded && question.type === "multiple_choice" && correctIds?.length) {
    return sameSet(answer.selectedOptionIds, correctIds) ? "correct" : "incorrect";
  }
  return "pending";
}

function gradeTone(grade: number) {
  if (grade >= 8) return { ring: "#14743a", text: "text-[#14743a]", label: "Rất tốt" };
  if (grade >= 6.5) return { ring: "#0066cc", text: "text-[#0066cc]", label: "Khá" };
  if (grade >= 5) return { ring: "#8a6110", text: "text-[#8a6110]", label: "Đạt" };
  return { ring: "#b42318", text: "text-[#b42318]", label: "Cần cố gắng thêm" };
}

export default function AssignmentResult({
  assignment,
  questions,
  submission,
  answers,
  answerKey,
}: AssignmentResultProps) {
  const graded = submission.status === "graded";
  const answersById = new Map(answers.map((answer) => [answer.questionId, answer]));
  const verdicts = questions.map((question) =>
    verdictFor(question, answersById.get(question.id), answerKey.get(question.id), graded),
  );
  const correct = verdicts.filter((verdict) => verdict === "correct").length;
  const checked = verdicts.filter((verdict) => verdict === "correct" || verdict === "incorrect").length;
  const maxPoints = questions.reduce((sum, question) => sum + (question.points ?? 0), 0);
  const awarded = answers.reduce((sum, answer) => sum + (answer.pointsAwarded ?? 0), 0);
  const hasPoints = answers.some((answer) => answer.pointsAwarded != null);
  const tone = submission.grade != null ? gradeTone(submission.grade) : null;
  const percent = submission.grade != null ? Math.max(0, Math.min(100, submission.grade * 10)) : 0;
  const workHref = `/assignment/${assignmentRouteId(assignment.rawId)}`;

  return (
    <div className="relative z-10 mx-auto w-[calc(100%-2rem)] max-w-6xl pb-24 pt-24 md:pb-28 md:pt-28">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#4f5865]">
        <Link href="/assignment" className="text-[#4f5865] no-underline hover:text-[#0066cc]">
          Bài tập
        </Link>
        <span>/</span>
        <Link href={workHref} className="text-[#4f5865] no-underline hover:text-[#0066cc]">
          {assignment.id}
        </Link>
        <span>/</span>
        <span className="text-[#07111f]">Kết quả</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <div className="space-y-8">
          <section className="liquid-glass p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-[#fff2cf] px-4 py-2 text-xs font-semibold text-[#855c00]">
                {assignment.category}
              </span>
              <span className={`rounded-full px-4 py-2 text-xs font-semibold ${statusClasses(assignment.status)}`}>
                {assignment.status}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-normal md:text-4xl">
              {assignment.title}
            </h1>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-[14px] border border-white/80 bg-white/50 px-4 py-3">
                <dt className="text-[#6e6e73]">Nộp lúc</dt>
                <dd className="mt-1 font-semibold">{formatDateTime(submission.submittedAt)}</dd>
              </div>
              <div className="rounded-[14px] border border-white/80 bg-white/50 px-4 py-3">
                <dt className="text-[#6e6e73]">Chấm lúc</dt>
                <dd className="mt-1 font-semibold">
                  {graded ? formatDateTime(submission.gradedAt) : "Đang chờ giáo viên chấm"}
                </dd>
              </div>
            </dl>
          </section>

          {graded ? (
            <section className="liquid-glass p-7 md:p-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
                Nhận xét của giáo viên
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#26313d]">
                {submission.feedback || "Giáo viên chưa để lại nhận xét chung cho bài này."}
              </p>
            </section>
          ) : (
            <section className="rounded-[20px] border border-[#b9d4f5] bg-[#eaf3ff]/90 p-6 text-[#0b4f99]">
              <p className="font-semibold">Bài của bạn đã được nộp và đang chờ chấm.</p>
              <p className="mt-2 text-sm leading-6">
                Khi giáo viên chấm xong, điểm, nhận xét và đáp án đúng sẽ hiện ở trang này. Bạn sẽ
                nhận được thông báo trên bảng điều khiển.
              </p>
            </section>
          )}

          {questions.length === 0 ? (
            <section className="liquid-glass p-7 md:p-10">
              <h2 className="text-2xl font-semibold">Bài làm của bạn</h2>
              <p className="mt-4 whitespace-pre-line rounded-[12px] border border-white/80 bg-white/50 p-5 text-base leading-7 text-[#26313d]">
                {submission.content || "Không có nội dung."}
              </p>
            </section>
          ) : (
            questions.map((question, index) => {
              const answer = answersById.get(question.id);
              const verdict = verdicts[index];
              const correctIds = graded ? (answerKey.get(question.id) ?? []) : [];

              return (
                <section key={question.id} className="liquid-glass p-7 md:p-9">
                  <div className="flex items-start gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#07111f] text-base font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="text-xl font-semibold leading-snug">{question.prompt}</h2>
                        <span className={`shrink-0 self-start rounded-full px-3 py-1.5 text-xs font-bold ${verdictStyles[verdict].className}`}>
                          {verdictStyles[verdict].label}
                        </span>
                      </div>
                      {question.scriptureReference && (
                        <p className="mt-2 text-xs font-semibold text-[#8a6110]">📖 {question.scriptureReference}</p>
                      )}

                      {question.type === "multiple_choice" ? (
                        <ul className="mt-6 grid gap-2.5">
                          {question.options.map((option, optionIndex) => {
                            const chosen = answer?.selectedOptionIds.includes(option.id) ?? false;
                            const isRight = correctIds.includes(option.id);
                            return (
                              <li
                                key={option.id}
                                className={[
                                  "flex items-center gap-3 rounded-[10px] border px-4 py-3 text-sm font-semibold",
                                  isRight
                                    ? "border-[#14743a]/40 bg-[#e5f7ec]/80 text-[#0f5a2d]"
                                    : chosen && graded && correctIds.length
                                      ? "border-[#b42318]/30 bg-[#fff1f0]/80 text-[#8f1d14]"
                                      : chosen
                                        ? "border-[#8a6110] bg-white/76 text-[#26313d]"
                                        : "border-[#cfd6e0] bg-white/38 text-[#4f5865]",
                                ].join(" ")}
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold uppercase">
                                  {String.fromCharCode(97 + optionIndex)}
                                </span>
                                <span className="flex-1">{option.text}</span>
                                {chosen && <span className="text-xs font-bold">Bạn chọn</span>}
                                {isRight && <span className="text-xs font-bold">Đáp án đúng</span>}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-6 whitespace-pre-line rounded-[12px] border border-white/80 bg-white/50 p-5 text-base leading-7 text-[#26313d]">
                          {answer?.answerText || "Bạn chưa trả lời câu này."}
                        </p>
                      )}

                      {answer?.scriptureRef && (
                        <p className="mt-4 text-sm text-[#4f5865]">
                          <span className="font-semibold text-[#07111f]">Kinh thánh: </span>
                          {answer.scriptureRef}
                        </p>
                      )}

                      {graded && (answer?.pointsAwarded != null || answer?.teacherComment) && (
                        <div className="mt-5 rounded-[12px] border border-[#14743a]/20 bg-[#e5f7ec]/70 p-4 text-sm leading-6 text-[#14743a]">
                          {answer?.pointsAwarded != null && (
                            <p className="font-semibold">
                              Điểm câu này: {answer.pointsAwarded}
                              {question.points != null ? `/${question.points}` : ""}
                            </p>
                          )}
                          {answer?.teacherComment && (
                            <p className="mt-1 whitespace-pre-line">{answer.teacherComment}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="liquid-glass p-7 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">Điểm của bạn</p>
            {graded && submission.grade != null && tone ? (
              <>
                <div
                  className="mx-auto mt-6 flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${tone.ring} ${percent}%, rgba(207,214,224,0.6) 0)`,
                  }}
                  role="img"
                  aria-label={`${submission.grade} trên 10 điểm`}
                >
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white/95">
                    <span className={`text-4xl font-semibold ${tone.text}`}>{submission.grade}</span>
                    <span className="text-sm font-semibold text-[#6e6e73]">/ 10</span>
                  </div>
                </div>
                <p className={`mt-4 text-base font-semibold ${tone.text}`}>{tone.label}</p>
              </>
            ) : (
              <p className="mt-6 text-lg font-semibold text-[#0066cc]">
                {graded ? "Đã chấm" : "Chờ chấm"}
              </p>
            )}
          </section>

          {questions.length > 0 && (
            <section className="liquid-glass grid gap-3 p-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">Số câu</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              {checked > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73]">Trả lời đúng</span>
                  <span className="font-semibold text-[#14743a]">
                    {correct}/{checked}
                  </span>
                </div>
              )}
              {graded && hasPoints && maxPoints > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73]">Tổng điểm các câu</span>
                  <span className="font-semibold">
                    {awarded}/{maxPoints}
                  </span>
                </div>
              )}
              {graded && answerKey.size === 0 && questions.some((q) => q.type === "multiple_choice") && (
                <p className="text-xs leading-5 text-[#6e6e73]">Đáp án đúng chưa được công bố cho bài này.</p>
              )}
            </section>
          )}

          <div className="grid gap-3">
            <Link
              href={workHref}
              className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#b9cdf2] bg-[#dfeaff] text-sm font-semibold text-[#07111f] no-underline"
            >
              <DashboardIcon name="document" className="h-4 w-4" />
              Xem lại bài làm
            </Link>
            <Link
              href="/assignment"
              className="flex h-12 items-center justify-center rounded-[14px] bg-[#07111f] text-sm font-semibold text-white no-underline"
            >
              Về danh sách bài tập
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
