"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AssignmentItem,
  fallbackAssignments,
  getAssignmentQuestions,
} from "@/com/assignment/assignmentData";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;
type TextValues = Record<string, string>;

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function AssignmentWorkClient({
  assignment,
}: {
  assignment: AssignmentItem;
}) {
  const questions = useMemo(
    () => getAssignmentQuestions(assignment),
    [assignment],
  );
  const [answers, setAnswers] = useState<Answers>({});
  const [scriptureRefs, setScriptureRefs] = useState<TextValues>({});
  const [flaggedNotes, setFlaggedNotes] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "draft" | "submitted">("idle");

  const isAnswered = (id: string) => {
    const answer = answers[id];
    if (Array.isArray(answer)) return answer.length > 0;
    return Boolean(answer?.trim());
  };

  const answeredCount = questions.filter((question) =>
    isAnswered(question.id),
  ).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const updateAnswer = (id: string, value: string) => {
    setStatus("idle");
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const toggleChoiceAnswer = (id: string, option: string) => {
    setStatus("idle");
    setAnswers((current) => {
      const currentAnswer = current[id];
      const selectedOptions = Array.isArray(currentAnswer)
        ? currentAnswer
        : typeof currentAnswer === "string" && currentAnswer
          ? [currentAnswer]
          : [];
      const nextOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((item) => item !== option)
        : [...selectedOptions, option];

      return { ...current, [id]: nextOptions };
    });
  };

  const isChoiceSelected = (id: string, option: string) => {
    const answer = answers[id];
    if (Array.isArray(answer)) return answer.includes(option);
    return answer === option;
  };

  const textAnswer = (id: string) => {
    const answer = answers[id];
    return typeof answer === "string" ? answer : "";
  };

  const updateScriptureRef = (id: string, value: string) => {
    setStatus("idle");
    setScriptureRefs((current) => ({ ...current, [id]: value }));
  };

  const toggleFlaggedNote = (id: string) => {
    setFlaggedNotes((current) => ({ ...current, [id]: !current[id] }));
  };

  const relatedAssignments = fallbackAssignments
    .filter((item) => item.id !== assignment.id)
    .slice(0, 2);

  return (
    <div className="relative z-10 mx-auto w-[calc(100%-2rem)] max-w-7xl pb-28 pt-24 md:pb-32 md:pt-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <div className="space-y-8">
          <section className="liquid-glass p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-[#fff2cf] px-4 py-2 text-xs font-semibold text-[#855c00]">
                {assignment.category}
              </span>
              <span className="flex items-center gap-2 font-semibold text-[#a11b1b]">
                <DashboardIcon name="calendar" className="h-4 w-4" />
                Hạn nộp: {formatDateTime(assignment.dueDate)}
              </span>
              <span className="rounded-full border border-white/80 bg-white/58 px-4 py-2 text-xs font-semibold text-[#4f5865]">
                #{assignment.id}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-normal md:text-4xl">
              {assignment.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#26313d]">
              {assignment.description} Hãy đọc kỹ câu hỏi, trả lời trung thực và
              dùng phần phản chiếu để ghi lại điều bạn học được trong hành trình
              này.
            </p>
          </section>

          {questions.map((question, questionIndex) => {
            const textValue = textAnswer(question.id);
            const flagged = flaggedNotes[question.id];

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
                      <h2 className="text-2xl font-semibold leading-snug tracking-normal">
                        {question.title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => toggleFlaggedNote(question.id)}
                        aria-pressed={flagged}
                        aria-label={
                          flagged
                            ? "Bỏ đánh dấu câu cần lưu ý"
                            : "Đánh dấu câu cần lưu ý"
                        }
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                          flagged
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

                    {question.type === "choice" ? (
                      <div className="mt-8 grid gap-3">
                        {question.options?.map((option) => (
                          <label
                            key={option}
                            className={[
                              "group flex min-h-18 cursor-pointer items-center gap-4 rounded-[10px] border px-6 py-4 transition-colors",
                              isChoiceSelected(question.id, option)
                                ? "border-[#8a6110] bg-white/72 shadow-[0_14px_30px_rgba(138,97,16,0.1)]"
                                : "border-[#cfd6e0] bg-white/38 hover:border-[#8a6110]/60 hover:bg-white/58",
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              name={question.id}
                              value={option}
                              checked={isChoiceSelected(question.id, option)}
                              onChange={() => toggleChoiceAnswer(question.id, option)}
                              className="sr-only"
                            />
                            <span
                              className={[
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                isChoiceSelected(question.id, option)
                                  ? "border-[#8a6110]"
                                  : "border-[#8993a1] bg-white/52",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "h-2.5 w-2.5 rounded-full",
                                  isChoiceSelected(question.id, option)
                                    ? "bg-[#8a6110]"
                                    : "bg-transparent",
                                ].join(" ")}
                              />
                            </span>
                            <span className="text-base leading-6 text-[#26313d]">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <label className="mt-8 block">
                        <span className="sr-only">{question.title}</span>
                        <div className="relative">
                          <textarea
                            value={textValue}
                            onChange={(event) =>
                              updateAnswer(question.id, event.target.value)
                            }
                            placeholder={question.placeholder}
                            rows={8}
                            maxLength={2000}
                            className="w-full resize-y rounded-[10px] border border-[#cfd6e0] bg-white/54 px-6 py-6 pb-12 text-base leading-7 outline-none transition-colors placeholder:text-[#26313d] focus:border-[#8a6110] focus:bg-white/78"
                          />
                          <span className="absolute bottom-4 right-5 text-sm font-semibold text-[#07111f]">
                            {textValue.length}/2000
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
                        value={scriptureRefs[question.id] || ""}
                        onChange={(event) =>
                          updateScriptureRef(question.id, event.target.value)
                        }
                        placeholder="Ví dụ: Giăng 1:1,..."
                        className="h-12 w-full border-0 border-b border-dashed border-[#07111f]/70 bg-transparent px-3 text-base outline-none placeholder:text-[#8a929c] focus:border-[#8a6110]"
                      />
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
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
                  Câu {answeredCount}/{questions.length} hoàn thành
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dfe8f3]">
                <div
                  className="h-full rounded-full bg-[#8a6110] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {questions.map((question, index) => {
                  const completed = isAnswered(question.id);
                  return (
                    <a
                      key={question.id}
                      href={`#question-${question.id}`}
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-[9px] border text-base font-bold no-underline",
                        completed
                          ? "border-[#8a6110] bg-[#8a6110] text-white"
                          : "border-[#b9c5d6] bg-[#dfe8f7]/72 text-[#07111f]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </a>
                  );
                })}
              </div>

              <div className="mt-9 rounded-[10px] border border-[#cfd6e0] bg-white/58 p-5 text-sm italic leading-7 text-[#26313d]">
                “Hãy để Lời Chúa soi sáng phần trả lời, không chỉ để hoàn thành
                bài tập mà còn để ghi nhớ điều cần sống ra.”
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <DashboardIcon name="book" className="h-5 w-5 text-[#8a6110]" />
                Bài tập liên quan
              </h2>
              <div className="grid gap-3">
                {relatedAssignments.map((item) => (
                  <Link
                    key={item.id}
                    href={`/assignment/${item.id}`}
                    className="rounded-[12px] border border-white/80 bg-white/62 p-4 text-[#07111f] no-underline shadow-[0_12px_30px_rgba(31,48,70,0.08)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <span className="shrink-0 rounded-full bg-[#dff7e8] px-3 py-1 text-xs font-medium text-[#118044]">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#4f5865]">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
              <Link
                href="/assignment"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#855c00] no-underline"
              >
                Xem thêm
                <span aria-hidden="true">→</span>
              </Link>
            </div>
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
            <button
              type="button"
              onClick={() => setStatus("submitted")}
              className="h-12 rounded-[14px] bg-[#07111f] px-8 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(7,17,31,0.2)]"
            >
              {status === "submitted" ? "Đã nộp bài" : "Nộp bài ngay"}
            </button>
            <button
              type="button"
              onClick={() => setStatus("draft")}
              className="h-12 rounded-[14px] border border-[#b9cdf2] bg-[#dfeaff] px-8 text-sm font-semibold text-[#07111f]"
            >
              {status === "draft" ? "Đã lưu nháp" : "Lưu nháp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
