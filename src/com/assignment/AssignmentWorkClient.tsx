"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  assignmentHref,
  type AssignmentAnswer,
  type AssignmentItem,
  type AssignmentQuestion,
  type AssignmentSubmission,
  formatDueDate,
  isPastDue,
  statusClasses,
} from "@/com/assignment/assignmentData";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type Draft = { answerText: string; selectedOptionIds: number[]; scriptureRef: string };

type AssignmentWorkClientProps = {
  assignment: AssignmentItem;
  questions: AssignmentQuestion[];
  submission: AssignmentSubmission | null;
  answers: AssignmentAnswer[];
  related: AssignmentItem[];
};

function initialDrafts(answers: AssignmentAnswer[]) {
  return Object.fromEntries(
    answers.map((answer) => [
      answer.questionId,
      {
        answerText: answer.answerText,
        selectedOptionIds: answer.selectedOptionIds,
        scriptureRef: answer.scriptureRef,
      },
    ]),
  ) as Record<number, Draft>;
}

const emptyDraft: Draft = { answerText: "", selectedOptionIds: [], scriptureRef: "" };

export default function AssignmentWorkClient({
  assignment,
  questions,
  submission,
  answers,
  related,
}: AssignmentWorkClientProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(() => initialDrafts(answers));
  const [content, setContent] = useState(submission?.content ?? "");
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<"draft" | "submitted" | null>(null);

  const locked = submission != null && submission.status !== "draft";
  const graded = submission?.status === "graded";
  const answersById = new Map(answers.map((answer) => [answer.questionId, answer]));
  const pastDue = isPastDue(assignment.dueDate);

  const draftFor = (id: number) => drafts[id] ?? emptyDraft;
  const isAnswered = (question: AssignmentQuestion) => {
    const draft = draftFor(question.id);
    return question.type === "essay"
      ? Boolean(draft.answerText.trim())
      : draft.selectedOptionIds.length > 0;
  };

  const totalItems = questions.length || 1;
  const answeredCount = questions.length
    ? questions.filter(isAnswered).length
    : content.trim()
      ? 1
      : 0;
  const progress = Math.round((answeredCount / totalItems) * 100);

  const edit = () => {
    setMessage("");
    setError("");
  };

  const updateDraft = (id: number, value: Partial<Draft>) => {
    edit();
    setDrafts((current) => ({ ...current, [id]: { ...(current[id] ?? emptyDraft), ...value } }));
  };

  const toggleOption = (question: AssignmentQuestion, optionId: number) => {
    const selected = draftFor(question.id).selectedOptionIds;
    const next = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : question.allowMultiple
        ? [...selected, optionId]
        : [optionId];
    updateDraft(question.id, { selectedOptionIds: next });
  };

  const save = async (status: "draft" | "submitted") => {
    if (
      status === "submitted" &&
      !window.confirm("Nộp bài? Sau khi nộp bạn sẽ không sửa được câu trả lời nữa.")
    ) {
      return;
    }
    setSaving(status);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/assignments/${assignment.rawId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          content,
          answers: questions.map((question) => ({
            questionId: question.id,
            ...draftFor(question.id),
          })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Không thể lưu bài làm.");

      setMessage(status === "submitted" ? "Đã nộp bài thành công." : "Đã lưu nháp.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu bài làm.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="relative z-10 mx-auto w-[calc(100%-2rem)] max-w-7xl pb-28 pt-24 md:pb-32 md:pt-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <div className="space-y-8">
          <section className="liquid-glass p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-[#fff2cf] px-4 py-2 text-xs font-semibold text-[#855c00]">
                {assignment.category}
              </span>
              <span
                className={[
                  "flex items-center gap-2 font-semibold",
                  pastDue ? "text-[#a11b1b]" : "text-[#26313d]",
                ].join(" ")}
              >
                <DashboardIcon name="calendar" className="h-4 w-4" />
                Hạn nộp: {formatDueDate(assignment.dueDate)}
              </span>
              <span className="rounded-full border border-white/80 bg-white/58 px-4 py-2 text-xs font-semibold text-[#4f5865]">
                #{assignment.id}
              </span>
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${statusClasses(assignment.status)}`}
              >
                {assignment.status}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-normal md:text-4xl">
              {assignment.title}
            </h1>
            {assignment.description && (
              <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-8 text-[#26313d]">
                {assignment.description}
              </p>
            )}
            {assignment.attachmentUrl && (
              <a
                href={assignment.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-[#b9cdf2] bg-[#dfeaff] px-5 text-sm font-semibold text-[#07111f] no-underline"
              >
                <DashboardIcon name="document" className="h-4 w-4" />
                Mở tài liệu đính kèm
              </a>
            )}
          </section>

          {graded && (
            <section className="liquid-glass border-l-4 border-l-[#14743a] p-7 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#14743a]">
                Kết quả
              </p>
              <p className="mt-3 text-4xl font-semibold">
                {submission?.grade != null ? `${submission.grade}/10` : "Đã chấm"}
              </p>
              {submission?.feedback && (
                <p className="mt-4 whitespace-pre-line text-base leading-7 text-[#26313d]">
                  <span className="font-semibold">Nhận xét của giáo viên: </span>
                  {submission.feedback}
                </p>
              )}
              <Link
                href={assignmentHref(assignment, true)}
                className="mt-5 inline-flex text-sm font-semibold text-[#14743a] no-underline hover:underline"
              >
                Xem chi tiết kết quả và đáp án →
              </Link>
            </section>
          )}

          {locked && !graded && (
            <p className="rounded-[16px] bg-[#eaf3ff] px-5 py-4 text-sm font-semibold text-[#0066cc]">
              Bạn đã nộp bài này. Bài đang chờ giáo viên chấm.
            </p>
          )}

          {questions.length === 0 ? (
            <section className="liquid-glass p-7 md:p-10">
              <h2 className="text-2xl font-semibold">Bài làm của bạn</h2>
              <p className="mt-2 text-sm leading-6 text-[#4f5865]">
                Bài tập này không có câu hỏi riêng. Hãy viết bài làm theo yêu cầu ở trên.
              </p>
              <div className="relative mt-6">
                <textarea
                  value={content}
                  onChange={(event) => {
                    edit();
                    setContent(event.target.value);
                  }}
                  disabled={locked}
                  placeholder="Viết bài làm của bạn tại đây..."
                  rows={12}
                  maxLength={5000}
                  className="w-full resize-y rounded-[10px] border border-[#cfd6e0] bg-white/54 px-6 py-6 pb-12 text-base leading-7 outline-none transition-colors placeholder:text-[#7b8490] focus:border-[#8a6110] focus:bg-white/78 disabled:cursor-not-allowed disabled:opacity-80"
                />
                <span className="absolute bottom-4 right-5 text-sm font-semibold text-[#07111f]">
                  {content.length}/5000
                </span>
              </div>
            </section>
          ) : (
            questions.map((question, questionIndex) => {
              const draft = draftFor(question.id);
              const result = answersById.get(question.id);

              return (
                <section
                  key={question.id}
                  id={`question-${question.id}`}
                  className="liquid-glass scroll-mt-28 p-7 md:p-10"
                >
                  <div className="flex items-start gap-5 md:gap-7">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#07111f] text-base font-bold text-white shadow-[0_12px_28px_rgba(7,17,31,0.22)]">
                      {questionIndex + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold leading-snug tracking-normal">
                            {question.prompt}
                            {question.isRequired && (
                              <span className="ml-1 text-[#b42318]" aria-label="bắt buộc">
                                *
                              </span>
                            )}
                          </h2>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#4f5865]">
                            {question.points != null && <span>{question.points} điểm</span>}
                            {question.type === "multiple_choice" && (
                              <span>
                                {question.allowMultiple ? "Chọn nhiều đáp án" : "Chọn một đáp án"}
                              </span>
                            )}
                            {question.scriptureReference && (
                              <span className="text-[#8a6110]">📖 {question.scriptureReference}</span>
                            )}
                          </div>
                          {question.helperText && (
                            <p className="mt-3 text-sm leading-6 text-[#4f5865]">{question.helperText}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFlagged((current) => ({ ...current, [question.id]: !current[question.id] }))
                          }
                          aria-pressed={Boolean(flagged[question.id])}
                          aria-label={
                            flagged[question.id] ? "Bỏ đánh dấu câu cần lưu ý" : "Đánh dấu câu cần lưu ý"
                          }
                          className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                            flagged[question.id]
                              ? "border-[#8a6110] bg-[#8a6110] text-white"
                              : "border-[#d9dee8] bg-white/64 text-[#6e6e73] hover:border-[#8a6110] hover:text-[#8a6110]",
                          ].join(" ")}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                          >
                            <path d="M6 4v16" />
                            <path d="M6 5h10l-1.4 4L16 13H6" />
                          </svg>
                        </button>
                      </div>

                      {question.type === "multiple_choice" ? (
                        <div className="mt-8 grid gap-3">
                          {question.options.map((option, optionIndex) => {
                            const selected = draft.selectedOptionIds.includes(option.id);
                            return (
                              <label
                                key={option.id}
                                className={[
                                  "group flex min-h-13 items-center gap-3 rounded-[8px] border px-4 py-3 transition-colors",
                                  locked ? "cursor-default" : "cursor-pointer",
                                  selected
                                    ? "border-[#8a6110] bg-white/76 shadow-[0_10px_22px_rgba(138,97,16,0.08)]"
                                    : "border-[#cfd6e0] bg-white/38 hover:border-[#8a6110]/60 hover:bg-white/58",
                                ].join(" ")}
                              >
                                <input
                                  type={question.allowMultiple ? "checkbox" : "radio"}
                                  name={`question-${question.id}`}
                                  checked={selected}
                                  disabled={locked}
                                  onChange={() => toggleOption(question, option.id)}
                                  className="sr-only"
                                />
                                <span
                                  className={[
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold uppercase",
                                    selected
                                      ? "border-[#8a6110] bg-[#8a6110] text-white"
                                      : "border-[#8993a1] bg-white/52 text-[#526174]",
                                  ].join(" ")}
                                >
                                  {String.fromCharCode(97 + optionIndex)}
                                </span>
                                <span className="text-sm font-semibold leading-5 text-[#26313d]">
                                  {option.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <label className="mt-8 block">
                          <span className="sr-only">{question.prompt}</span>
                          <div className="relative">
                            <textarea
                              value={draft.answerText}
                              onChange={(event) =>
                                updateDraft(question.id, { answerText: event.target.value })
                              }
                              disabled={locked}
                              placeholder={question.answerHint || "Viết câu trả lời của bạn tại đây..."}
                              rows={8}
                              maxLength={5000}
                              className="w-full resize-y rounded-[10px] border border-[#cfd6e0] bg-white/54 px-6 py-6 pb-12 text-base leading-7 outline-none transition-colors placeholder:text-[#7b8490] focus:border-[#8a6110] focus:bg-white/78 disabled:cursor-not-allowed disabled:opacity-80"
                            />
                            <span className="absolute bottom-4 right-5 text-sm font-semibold text-[#07111f]">
                              {draft.answerText.length}/5000
                            </span>
                          </div>
                        </label>
                      )}

                      <div className="mt-6 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                        <label
                          htmlFor={`scripture-${question.id}`}
                          className="text-base font-medium text-[#07111f]"
                        >
                          Kinh thánh:
                        </label>
                        <input
                          id={`scripture-${question.id}`}
                          value={draft.scriptureRef}
                          onChange={(event) =>
                            updateDraft(question.id, { scriptureRef: event.target.value })
                          }
                          disabled={locked}
                          maxLength={300}
                          placeholder="Ví dụ: Giăng 1:1,..."
                          className="h-12 w-full border-0 border-b border-dashed border-[#07111f]/70 bg-transparent px-3 text-base outline-none placeholder:text-[#8a929c] focus:border-[#8a6110] disabled:cursor-not-allowed"
                        />
                      </div>

                      {graded && result && (result.pointsAwarded != null || result.teacherComment) && (
                        <div className="mt-6 rounded-[12px] border border-[#14743a]/20 bg-[#e5f7ec]/70 p-4 text-sm leading-6 text-[#14743a]">
                          {result.pointsAwarded != null && (
                            <p className="font-semibold">
                              Điểm câu này: {result.pointsAwarded}
                              {question.points != null ? `/${question.points}` : ""}
                            </p>
                          )}
                          {result.teacherComment && <p className="mt-1">{result.teacherComment}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-7">
            <div className="liquid-glass p-7 md:p-8">
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <DashboardIcon name="document" className="h-5 w-5 text-[#8a6110]" />
                Tiến độ làm bài
              </h2>
              <div className="mt-7 flex items-center justify-between text-sm font-semibold">
                <span>
                  {questions.length
                    ? `Câu ${answeredCount}/${questions.length} hoàn thành`
                    : answeredCount
                      ? "Đã có bài làm"
                      : "Chưa có bài làm"}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dfe8f3]">
                <div
                  className="h-full rounded-full bg-[#8a6110] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {questions.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {questions.map((question, index) => (
                    <a
                      key={question.id}
                      href={`#question-${question.id}`}
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-[9px] border text-base font-bold no-underline",
                        isAnswered(question)
                          ? "border-[#8a6110] bg-[#8a6110] text-white"
                          : flagged[question.id]
                            ? "border-[#8a6110] bg-white/70 text-[#8a6110]"
                            : "border-[#b9c5d6] bg-[#dfe8f7]/72 text-[#07111f]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </a>
                  ))}
                </div>
              )}

              {submission?.submittedAt && (
                <p className="mt-6 text-sm text-[#4f5865]">
                  Đã nộp lúc{" "}
                  {new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "Asia/Ho_Chi_Minh",
                  }).format(new Date(submission.submittedAt))}
                </p>
              )}

              <div className="mt-9 rounded-[10px] border border-[#cfd6e0] bg-white/58 p-5 text-sm italic leading-7 text-[#26313d]">
                “Hãy để Lời Chúa soi sáng phần trả lời, không chỉ để hoàn thành
                bài tập mà còn để ghi nhớ điều cần sống ra.”
              </div>
            </div>

            {related.length > 0 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold">
                  <DashboardIcon name="book" className="h-5 w-5 text-[#8a6110]" />
                  Bài tập khác cần làm
                </h2>
                <div className="grid gap-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={assignmentHref(item)}
                      className="rounded-[12px] border border-white/80 bg-white/62 p-4 text-[#07111f] no-underline shadow-[0_12px_30px_rgba(31,48,70,0.08)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClasses(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-[#4f5865]">
                        Hạn: {formatDueDate(item.dueDate)}
                      </p>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/assignment"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#855c00] no-underline"
                >
                  Xem tất cả
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="sticky bottom-4 z-30 mt-10 rounded-[22px] border border-white/80 bg-[rgba(248,251,255,0.78)] px-4 py-4 shadow-[0_18px_44px_rgba(31,48,70,0.14)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/assignment"
            className="flex h-11 items-center gap-2 text-sm font-semibold text-[#4f5865] no-underline"
          >
            <span aria-hidden="true">←</span>
            Quay lại
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            {(message || error) && (
              <p
                role="status"
                className={[
                  "flex min-h-12 items-center rounded-[14px] px-4 text-sm font-semibold",
                  error ? "bg-[#fff1f0] text-[#b42318]" : "bg-[#ecfdf3] text-[#15803d]",
                ].join(" ")}
              >
                {error || message}
              </p>
            )}
            {locked ? (
              <>
                <span className="flex h-12 items-center rounded-[14px] bg-[#eaf3ff] px-6 text-sm font-semibold text-[#0066cc]">
                  {graded ? "Đã chấm điểm" : "Đã nộp bài"}
                </span>
                <Link
                  href={assignmentHref(assignment, true)}
                  className="flex h-12 items-center justify-center rounded-[14px] bg-[#07111f] px-8 text-sm font-semibold text-white no-underline shadow-[0_14px_28px_rgba(7,17,31,0.2)]"
                >
                  {graded ? "Xem điểm và nhận xét" : "Xem bài đã nộp"}
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => save("submitted")}
                  disabled={saving !== null}
                  className="h-12 rounded-[14px] bg-[#07111f] px-8 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(7,17,31,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving === "submitted" ? "Đang nộp..." : "Nộp bài ngay"}
                </button>
                <button
                  type="button"
                  onClick={() => save("draft")}
                  disabled={saving !== null}
                  className="h-12 rounded-[14px] border border-[#b9cdf2] bg-[#dfeaff] px-8 text-sm font-semibold text-[#07111f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
