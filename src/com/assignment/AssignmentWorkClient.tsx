"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AssignmentItem,
  getAssignmentQuestions,
} from "@/com/assignment/assignmentData";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function choiceLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export default function AssignmentWorkClient({
  assignment,
}: {
  assignment: AssignmentItem;
}) {
  const questions = useMemo(() => getAssignmentQuestions(assignment), [assignment]);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<"idle" | "draft" | "submitted">("idle");

  const isAnswered = (id: string) => {
    const answer = answers[id];
    if (Array.isArray(answer)) return answer.length > 0;
    return Boolean(answer?.trim());
  };

  const answeredCount = questions.filter((question) => isAnswered(question.id)).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const updateAnswer = (id: string, value: string) => {
    setStatus("idle");
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const toggleChoiceAnswer = (id: string, option: string) => {
    setStatus("idle");
    setAnswers((current) => {
      const currentAnswer = current[id];
      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
      const nextOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((item) => item !== option)
        : [...selectedOptions, option];

      return { ...current, [id]: nextOptions };
    });
  };

  const isChoiceSelected = (id: string, option: string) => {
    const answer = answers[id];
    return Array.isArray(answer) && answer.includes(option);
  };

  const textAnswer = (id: string) => {
    const answer = answers[id];
    return typeof answer === "string" ? answer : "";
  };

  return (
    <div className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl pb-28 pt-24 md:pb-32 md:pt-28">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <div className="space-y-6">
          <section className="liquid-glass p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-[#fff2cf] px-3 py-1.5 text-xs font-semibold text-[#855c00]">
                {assignment.category}
              </span>
              <span className="flex items-center gap-2 text-[#4f5865]">
                <DashboardIcon name="calendar" className="h-4 w-4" />
                Hạn nộp: 23:59, {formatDateTime(assignment.dueDate)}
              </span>
              <span className="rounded-full border border-white/80 bg-white/58 px-3 py-1.5 text-xs font-semibold text-[#4f5865]">
                #{assignment.id}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
              {assignment.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#4f5865]">
              {assignment.description} Hãy đọc kỹ câu hỏi, trả lời trung thực và
              dùng phần phản chiếu để ghi lại điều bạn học được trong hành trình này.
            </p>
          </section>

          <section className="liquid-glass p-6 md:p-8">
            <h2 className="border-l-2 border-[#8a6110] pl-3 text-2xl font-semibold">
              Phần 1: Trắc nghiệm khách quan
            </h2>
            <div className="mt-8 space-y-9">
              {questions
                .filter((question) => question.type === "choice")
                .map((question, questionIndex) => (
                  <div key={question.id}>
                    <p className="text-base font-semibold">
                      {questionIndex + 1}. {question.title}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {question.options?.map((option, optionIndex) => (
                        <label
                          key={option}
                          className={[
                            "group flex cursor-pointer items-center gap-3 rounded-[18px] border p-4 transition-transform hover:-translate-y-1",
                            isChoiceSelected(question.id, option)
                              ? "border-[#0066cc] bg-[#eaf3ff]/86 shadow-[0_14px_28px_rgba(0,102,204,0.12)]"
                              : "border-white/80 bg-white/48",
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
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                              isChoiceSelected(question.id, option)
                                ? "border-[#0066cc] bg-[#0066cc] text-white"
                                : "border-[#a3adba] bg-white/70 text-[#6e6e73]",
                            ].join(" ")}
                          >
                            {choiceLetter(optionIndex)}
                          </span>
                          <span className="text-sm font-medium leading-6 text-[#26313d]">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className="liquid-glass p-6 md:p-8">
            <h2 className="border-l-2 border-[#8a6110] pl-3 text-2xl font-semibold">
              Phần 2: Tự luận và phản chiếu
            </h2>
            <div className="mt-8 space-y-8">
              {questions
                .filter((question) => question.type === "textarea")
                .map((question, questionIndex) => (
                  <label key={question.id} className="block">
                    <span className="text-base font-semibold">
                      {questionIndex + 1}. {question.title}
                    </span>
                    <textarea
                      value={textAnswer(question.id)}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                      placeholder={question.placeholder}
                      rows={7}
                      className="mt-4 w-full resize-y rounded-[20px] border border-white/90 bg-white/58 p-5 text-sm leading-7 outline-none transition-colors placeholder:text-[#8a929c] focus:border-[#0066cc] focus:bg-white/78"
                    />
                  </label>
                ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="liquid-glass p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Tiến độ của bạn</h2>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e7edf7]">
              <div
                className="h-full rounded-full bg-[#8a6110] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#4f5865]">
              Đã hoàn thành: {answeredCount}/{questions.length} câu hỏi
            </p>

            <div className="mt-8 space-y-4">
              {questions.map((question, index) => {
                const completed = isAnswered(question.id);
                return (
                  <div key={question.id} className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                        completed
                          ? "border-[#8a6110] bg-[#8a6110] text-white"
                          : "border-[#a3adba] bg-white/58 text-transparent",
                      ].join(" ")}
                    >
                      ✓
                    </span>
                    <p className={completed ? "text-sm text-[#26313d]" : "text-sm text-[#8a929c]"}>
                      {question.type === "choice" ? "Trắc nghiệm" : "Tự luận"}: Câu {index + 1}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-[20px] border border-white/80 bg-white/52 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#855c00]">
                <DashboardIcon name="document" className="h-4 w-4" />
                Gợi ý trao đổi
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[#4f5865]">
                <p>“Điều gì khiến bạn thấy khó tập trung nhất khi làm bài này?”</p>
                <p>“Bạn muốn nhờ nhóm nhỏ cầu thay cho điểm nào trong tuần này?”</p>
              </div>
              <Link
                href="/contact"
                className="mt-6 flex h-11 items-center justify-center rounded-full border border-[#8a6110]/40 bg-white/58 text-sm font-semibold text-[#855c00] no-underline"
              >
                Hỏi cộng đồng
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-[rgba(248,251,255,0.78)] px-4 py-4 shadow-[0_-18px_44px_rgba(31,48,70,0.12)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/assignment"
            className="flex h-11 items-center gap-2 text-sm font-semibold text-[#4f5865] no-underline"
          >
            <span aria-hidden="true">←</span>
            Quay lại
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatus("draft")}
              className="h-12 rounded-[14px] border border-[#8a6110]/42 bg-white/62 px-8 text-sm font-semibold text-[#855c00]"
            >
              {status === "draft" ? "Đã lưu nháp" : "Lưu nháp"}
            </button>
            <button
              type="button"
              onClick={() => setStatus("submitted")}
              className="h-12 rounded-[14px] bg-[#07111f] px-8 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(7,17,31,0.2)]"
            >
              {status === "submitted" ? "Đã nộp bài" : "Nộp bài tập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
