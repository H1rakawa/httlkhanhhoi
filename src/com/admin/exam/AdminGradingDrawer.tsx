"use client";

import { toast } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import {
  AdminDrawer,
  Field,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "@/com/admin/ui/AdminUi";
import { adminFetch, formatVnDateTime } from "@/com/admin/ui/adminClient";
import type { GradingSubmission } from "@/lib/admin/grading";

type AnswerDraft = {
  pointsAwarded: string;
  isCorrect: boolean | null;
  teacherComment: string;
};

const round = (value: number) => Math.round(value * 100) / 100;

export default function AdminGradingDrawer({
  examId,
  submissionId,
  onClose,
  onSaved,
}: {
  examId: string;
  submissionId: string;
  onClose: () => void;
  onSaved: (submission: GradingSubmission) => void;
}) {
  const [submission, setSubmission] = useState<GradingSubmission | null>(null);
  const [loadError, setLoadError] = useState("");
  const [drafts, setDrafts] = useState<Record<number, AnswerDraft>>({});
  const [grade, setGrade] = useState("");
  const [gradeTouched, setGradeTouched] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const url = `/api/admin/exams/${encodeURIComponent(examId)}/submissions/${submissionId}`;

  useEffect(() => {
    let active = true;
    adminFetch<{ submission: GradingSubmission }>(url)
      .then(({ submission: data }) => {
        if (!active) return;
        setSubmission(data);
        const answers = new Map(data.answers.map((answer) => [answer.questionId, answer]));
        const next: Record<number, AnswerDraft> = {};
        for (const question of data.questions) {
          const answer = answers.get(question.id);
          // Chưa chấm: gợi ý điểm cho câu trắc nghiệm theo đáp án đúng.
          const suggested =
            answer?.pointsAwarded ??
            (answer?.autoCorrect == null ? null : answer.autoCorrect ? question.points : 0);
          next[question.id] = {
            pointsAwarded: suggested == null ? "" : String(suggested),
            isCorrect: answer?.isCorrect ?? answer?.autoCorrect ?? null,
            teacherComment: answer?.teacherComment ?? "",
          };
        }
        setDrafts(next);
        setGrade(data.grade == null ? "" : String(data.grade));
        setGradeTouched(data.grade != null);
        setFeedback(data.feedback ?? "");
      })
      .catch((fetchError: unknown) => {
        if (active) setLoadError(fetchError instanceof Error ? fetchError.message : "Không thể tải bài nộp.");
      });
    return () => {
      active = false;
    };
  }, [url]);

  const totals = useMemo(() => {
    if (!submission) return { earned: 0, max: 0, suggested: null as number | null };
    let earned = 0;
    let max = 0;
    for (const question of submission.questions) {
      max += question.points;
      const value = Number(drafts[question.id]?.pointsAwarded);
      if (Number.isFinite(value)) earned += value;
    }
    return { earned: round(earned), max: round(max), suggested: max > 0 ? round((earned / max) * 10) : null };
  }, [submission, drafts]);

  const shownGrade = gradeTouched ? grade : totals.suggested == null ? grade : String(totals.suggested);

  const updateDraft = (questionId: number, patch: Partial<AnswerDraft>) =>
    setDrafts((current) => ({ ...current, [questionId]: { ...current[questionId], ...patch } }));

  const save = async (status: "graded" | "submitted") => {
    if (!submission) return;
    if (status === "graded" && shownGrade.trim() === "") return setError("Vui lòng nhập điểm (thang 10).");
    setError("");
    setBusy(true);
    try {
      const { submission: saved } = await adminFetch<{ submission: GradingSubmission }>(url, {
        method: "PATCH",
        body: {
          status,
          grade: status === "graded" ? Number(shownGrade) : null,
          feedback,
          answers: submission.questions.map((question) => {
            const draft = drafts[question.id];
            return {
              questionId: question.id,
              pointsAwarded: draft?.pointsAwarded === "" ? null : Number(draft?.pointsAwarded),
              isCorrect: draft?.isCorrect ?? null,
              teacherComment: draft?.teacherComment ?? "",
            };
          }),
        },
      });
      toast.success(status === "graded" ? "Đã lưu điểm và báo cho học viên" : "Đã chuyển về chờ chấm", {
        timeout: 3000,
      });
      onSaved(saved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu điểm.");
    } finally {
      setBusy(false);
    }
  };

  const answers = new Map(submission?.answers.map((answer) => [answer.questionId, answer]) ?? []);

  return (
    <AdminDrawer
      wide
      title={submission ? `Chấm bài · ${submission.studentName}` : "Chấm bài"}
      subtitle={
        submission
          ? `${submission.assignmentTitle} · nộp lúc ${submission.submittedAt ? formatVnDateTime(submission.submittedAt) : "—"}${submission.gradedAt ? ` · chấm lúc ${formatVnDateTime(submission.gradedAt)}` : ""}`
          : undefined
      }
      onClose={onClose}
      footer={
        submission && submission.status !== "draft" ? (
          <>
            {submission.status === "graded" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => save("submitted")}
                className={`${secondaryButtonClassName} mr-auto`}
              >
                Huỷ kết quả chấm
              </button>
            )}
            <button type="button" onClick={onClose} className={secondaryButtonClassName}>
              Đóng
            </button>
            <button type="button" disabled={busy} onClick={() => save("graded")} className={primaryButtonClassName}>
              {busy ? "Đang lưu…" : submission.status === "graded" ? "Cập nhật điểm" : "Lưu điểm"}
            </button>
          </>
        ) : undefined
      }
    >
      {loadError && <p className="rounded-[12px] bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#b42318]">{loadError}</p>}
      {!submission && !loadError && <p className="text-sm font-bold text-[#667085]">Đang tải bài nộp…</p>}
      {submission && (
        <div className="grid gap-6">
          {submission.status === "draft" && (
            <p className="rounded-[12px] bg-[#fff7df] px-4 py-3 text-sm font-bold text-[#8a6110]">
              Học viên đang làm bài và chưa nộp, nên chưa thể chấm.
            </p>
          )}
          {error && <p className="rounded-[12px] bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#b42318]">{error}</p>}

          {submission.content && (
            <section className="rounded-[16px] border border-[#e4e9f1] bg-white p-4">
              <p className="text-xs font-extrabold uppercase text-[#667085]">Ghi chú của học viên</p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#344054]">{submission.content}</p>
            </section>
          )}

          {submission.questions.length === 0 && (
            <p className="text-sm font-bold text-[#667085]">Bài tập không có câu hỏi; chỉ cần nhập điểm và nhận xét chung.</p>
          )}

          {submission.questions.map((question, index) => {
            const answer = answers.get(question.id);
            const draft = drafts[question.id];
            const selected = new Set(answer?.selectedOptionIds ?? []);
            return (
              <section key={question.id} className="rounded-[16px] border border-[#e4e9f1] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-black leading-6 text-[#101418]">
                    Câu {index + 1}: {question.prompt}
                  </h3>
                  <span className="shrink-0 rounded-full bg-[#edf2fb] px-2.5 py-1 text-[11px] font-black text-[#526174]">
                    {question.points} điểm
                  </span>
                </div>

                {question.type === "multiple_choice" ? (
                  <ul className="mt-3 grid gap-2">
                    {question.options.map((option) => {
                      const chosen = selected.has(option.id);
                      return (
                        <li
                          key={option.id}
                          className={[
                            "flex items-center gap-2 rounded-[10px] border px-3 py-2 text-sm font-bold",
                            option.isCorrect
                              ? "border-[#9ad2ae] bg-[#ecfdf3] text-[#14743a]"
                              : chosen
                                ? "border-[#f5b5ae] bg-[#fff1f0] text-[#b42318]"
                                : "border-[#e5eaf2] text-[#475467]",
                          ].join(" ")}
                        >
                          <span aria-hidden="true">{chosen ? "●" : "○"}</span>
                          <span className="flex-1">{option.text}</span>
                          {option.isCorrect && <span className="text-[11px] font-black">Đáp án</span>}
                          {chosen && <span className="text-[11px] font-black">Học viên chọn</span>}
                        </li>
                      );
                    })}
                    {!answer?.selectedOptionIds.length && (
                      <li className="text-xs font-bold text-[#8a94a6]">Học viên không chọn đáp án.</li>
                    )}
                  </ul>
                ) : (
                  <div className="mt-3 whitespace-pre-wrap rounded-[10px] bg-[#f4f6fb] p-3 text-sm font-semibold leading-6 text-[#344054]">
                    {answer?.answerText || <span className="text-[#8a94a6]">Không có câu trả lời.</span>}
                    {answer?.scriptureRef && (
                      <p className="mt-2 text-xs font-bold text-[#667085]">Câu Kinh Thánh: {answer.scriptureRef}</p>
                    )}
                  </div>
                )}

                {draft && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <Field label={`Điểm (tối đa ${question.points})`}>
                      <input
                        type="number"
                        min={0}
                        max={question.points}
                        step={0.25}
                        value={draft.pointsAwarded}
                        disabled={submission.status === "draft"}
                        onChange={(event) => {
                          const value = event.target.value;
                          const number = Number(value);
                          updateDraft(question.id, {
                            pointsAwarded: value,
                            isCorrect: value === "" ? null : number >= question.points,
                          });
                        }}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Nhận xét câu này">
                      <input
                        value={draft.teacherComment}
                        maxLength={2000}
                        disabled={submission.status === "draft"}
                        onChange={(event) => updateDraft(question.id, { teacherComment: event.target.value })}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                )}
              </section>
            );
          })}

          {submission.status !== "draft" && (
            <section className="grid gap-4 rounded-[16px] border border-[#c9d8ee] bg-[#f4f8ff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-[#344054]">
                <span>
                  Tổng điểm các câu: {totals.earned}/{totals.max}
                </span>
                {totals.suggested != null && <span>Quy đổi thang 10: {totals.suggested}</span>}
              </div>
              <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <Field label="Điểm (thang 10)" required hint={gradeTouched ? "Đã nhập tay" : "Tự tính từ điểm từng câu"}>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    value={shownGrade}
                    onChange={(event) => {
                      setGradeTouched(true);
                      setGrade(event.target.value);
                    }}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Nhận xét chung" hint="Học viên thấy ở trang kết quả">
                  <textarea
                    value={feedback}
                    maxLength={4000}
                    onChange={(event) => setFeedback(event.target.value)}
                    className={`${textareaClassName} !min-h-28`}
                  />
                </Field>
              </div>
            </section>
          )}
        </div>
      )}
    </AdminDrawer>
  );
}
