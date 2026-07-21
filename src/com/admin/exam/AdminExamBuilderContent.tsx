"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AdminSidebar from "@/com/admin/AdminSidebar";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type AdminExamBuilderContentProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
};

type QuestionType = "multiple_choice" | "essay";

type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuestionDraft = {
  id: string;
  type: QuestionType;
  prompt: string;
  helperText: string;
  scriptureReference: string;
  allowMultiple: boolean;
  options: QuestionOption[];
};

const categories = [
  "Thánh học căn bản",
  "Tâm linh",
  "Kinh Thánh",
  "Cộng đồng",
  "Kỹ năng",
];

const questionTypeOptions: Array<{ value: QuestionType; label: string }> = [
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "essay", label: "Tự luận" },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createQuestion(type: QuestionType = "multiple_choice"): QuestionDraft {
  return {
    id: createId("question"),
    type,
    prompt: "",
    helperText: "",
    scriptureReference: "",
    allowMultiple: true,
    options:
      type === "multiple_choice"
        ? [
            { id: createId("option"), text: "", isCorrect: false },
            { id: createId("option"), text: "", isCorrect: false },
          ]
        : [],
  };
}

function AdminExamBuilderHeader({
  isSaving,
  onSaveDraft,
  onPublish,
}: {
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-extrabold text-[#667085]">
          <Link href="/admin/exam" className="transition hover:text-[#0066cc]">
            Quản lý bài tập
          </Link>
          <span>/</span>
          <span className="text-[#101828]">Thêm bài tập mới</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-[-0.055em] text-[#0f172a]">
          Tạo bài tập mới
        </h1>
        <p className="mt-2 text-sm font-bold text-[#667085]">
          Thiết lập thông tin cơ bản và câu hỏi cho bài kiểm tra.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d8dde6] bg-white/82 px-5 text-sm font-extrabold text-[#1f2937] shadow-[0_14px_32px_rgba(31,48,70,0.1)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DashboardIcon name="document" className="h-4 w-4" />
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066cc] px-7 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(0,102,204,0.24)] transition hover:bg-[#0057ad] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tiếp tục
        </button>
      </div>
    </header>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#667085]">
      {children}
    </label>
  );
}

function IconTooltipButton({
  label,
  className,
  wrapperClassName = "w-fit",
  children,
  onClick,
}: {
  label: string;
  className: string;
  wrapperClassName?: string;
  children: ReactNode;
  onClick: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const showTooltip = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left = Math.min(
      Math.max(rect.left + rect.width / 2, 88),
      window.innerWidth - 88,
    );

    setTooltipPosition({
      left,
      top: rect.bottom + 10,
    });
  };

  const hideTooltip = () => setTooltipPosition(null);

  return (
    <span
      className={["relative inline-flex overflow-visible", wrapperClassName].join(" ")}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
        aria-label={label}
      >
        {children}
      </button>
      {tooltipPosition
        ? createPortal(
            <span
              className="pointer-events-none fixed z-[100000] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[#0f172a] shadow-[0_16px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl"
              style={{
                left: tooltipPosition.left,
                top: tooltipPosition.top,
              }}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}

function InfoPanel({
  title,
  setTitle,
  code,
  setCode,
  category,
  setCategory,
  dueDate,
  setDueDate,
  description,
  setDescription,
}: {
  title: string;
  setTitle: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  return (
    <section className="liquid-glass mt-8 rounded-[26px] p-5 shadow-[0_24px_70px_rgba(31,48,70,0.1)] md:p-7">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2ce] text-xs font-extrabold text-[#8a6110]">
          i
        </span>
        <h2 className="text-xl font-extrabold tracking-[-0.04em] text-[#252b31]">
          Thông tin tổng quan
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <FieldLabel>Tiêu đề bài tập</FieldLabel>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nhập tên bài tập..."
            className="h-12 rounded-[14px] border border-[#dce3ed] bg-white/86 px-4 text-sm font-bold text-[#101828] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>Mã bài tập</FieldLabel>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Nhập mã bài tập..."
            className="h-12 rounded-[14px] border border-[#dce3ed] bg-white/86 px-4 text-sm font-bold text-[#101828] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>Danh mục</FieldLabel>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 rounded-[14px] border border-[#dce3ed] bg-white/86 px-4 text-sm font-bold text-[#101828] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <FieldLabel>Hạn chót</FieldLabel>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-12 rounded-[14px] border border-[#dce3ed] bg-white/86 px-4 text-sm font-bold text-[#101828] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <FieldLabel>Mô tả ngắn</FieldLabel>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Nhập mô tả ngắn để học viên hiểu mục tiêu bài tập..."
            rows={3}
            className="resize-none rounded-[14px] border border-[#dce3ed] bg-white/86 px-4 py-3 text-sm font-bold leading-6 text-[#101828] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
          />
        </div>
      </div>
    </section>
  );
}

function QuestionTypeDropdown({
  value,
  onChange,
}: {
  value: QuestionType;
  onChange: (value: QuestionType) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const selectedLabel =
    questionTypeOptions.find((option) => option.value === value)?.label ??
    "Trắc nghiệm";

  const openDropdown = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuRect({
      left: rect.left,
      top: rect.bottom + 8,
      width: rect.width,
    });
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openDropdown();
  };

  return (
    <div className="relative z-40 overflow-visible">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className="flex h-11 min-w-[164px] items-center justify-between gap-3 rounded-[14px] border border-[#e6edf5] bg-white px-4 text-sm font-extrabold text-[#8a6110] shadow-[0_12px_28px_rgba(31,48,70,0.08)] transition hover:bg-[#f8fbff]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedLabel}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={[
            "h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && menuRect
        ? createPortal(
        <div
          className="fixed z-[100000] min-w-[164px] overflow-hidden rounded-[16px] border border-[#e6edf5] bg-white p-1.5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
          role="listbox"
          style={{
            left: menuRect.left,
            top: menuRect.top,
            width: menuRect.width,
          }}
        >
          {questionTypeOptions.map((option) => {
            const isActive = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-sm font-extrabold transition",
                  isActive
                    ? "bg-[#e8f2ff] text-[#0066cc]"
                    : "text-[#344054] hover:bg-[#f3f7fb]",
                ].join(" ")}
                role="option"
                aria-selected={isActive}
              >
                <span>{option.label}</span>
                {isActive && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function QuestionCard({
  question,
  index,
  onChange,
  onRemove,
}: {
  question: QuestionDraft;
  index: number;
  onChange: (question: QuestionDraft) => void;
  onRemove: () => void;
}) {
  const accentClass =
    question.type === "essay"
      ? "border-l-[#d7e3f3]"
      : "border-l-[#8a6110]";

  const updateOption = (
    optionId: string,
    patch: Partial<Omit<QuestionOption, "id">>,
  ) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, ...patch } : option,
      ),
    });
  };

  return (
    <article
      className={[
        "liquid-glass overflow-visible rounded-[24px] border-l-4 p-5 shadow-[0_22px_70px_rgba(31,48,70,0.1)] md:p-7",
        accentClass,
      ].join(" ")}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0066cc] text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(0,102,204,0.24)]">
            {index + 1}
          </span>
          <QuestionTypeDropdown
            value={question.type}
            onChange={(type) => {
              onChange({
                ...createQuestion(type),
                id: question.id,
                prompt: question.prompt,
              });
            }}
          />
        </div>
        <IconTooltipButton
          label="Xóa câu hỏi"
          onClick={onRemove}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#ef4444] transition hover:bg-[#fff1f0]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>
        </IconTooltipButton>
      </div>

      <textarea
        value={question.prompt}
        onChange={(event) => onChange({ ...question, prompt: event.target.value })}
        placeholder={
          question.type === "essay"
            ? "Nhập đề bài tự luận..."
            : "Nhập câu hỏi của bạn tại đây..."
        }
        rows={3}
        className="w-full resize-none rounded-[14px] border border-[#dce3ed] bg-white/88 px-4 py-3 text-sm font-bold leading-6 text-[#101828] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
      />

      {question.type === "multiple_choice" ? (
        <div className="mt-4 grid gap-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={[
                "grid gap-2 rounded-[14px] border px-3 py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]",
                option.isCorrect
                  ? "border-[#8bc4ff] bg-[#eaf4ff]"
                  : "border-[#e7edf4] bg-white/78",
              ].join(" ")}
            >
              <IconTooltipButton
                label={option.isCorrect ? "Bỏ đáp án đúng" : "Đánh dấu đáp án đúng"}
                onClick={() => updateOption(option.id, { isCorrect: !option.isCorrect })}
                wrapperClassName="w-fit justify-self-start overflow-visible"
                className={[
                  "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border transition",
                  option.isCorrect
                    ? "border-[#0066cc] bg-[#0066cc] text-white shadow-[0_10px_22px_rgba(0,102,204,0.2)]"
                    : "border-[#a6b0bd] bg-white text-[#8a98a8] hover:border-[#0066cc] hover:text-[#0066cc]",
                ].join(" ")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </IconTooltipButton>
              <input
                value={option.text}
                onChange={(event) =>
                  updateOption(option.id, { text: event.target.value })
                }
                placeholder="Nhập lựa chọn đáp án..."
                className="min-w-0 bg-transparent text-sm font-bold text-[#101828] outline-none placeholder:text-[#98a2b3]"
              />
              <IconTooltipButton
                label="Xóa đáp án"
                onClick={() =>
                  onChange({
                    ...question,
                    options: question.options.filter((item) => item.id !== option.id),
                  })
                }
                wrapperClassName="w-fit justify-self-start overflow-visible"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#ef4444] transition hover:bg-[#fff1f0]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
              </IconTooltipButton>
            </div>
          ))}

          <IconTooltipButton
            label="Thêm đáp án"
            onClick={() =>
              onChange({
                ...question,
                options: [
                  ...question.options,
                  { id: createId("option"), text: "", isCorrect: false },
                ],
              })
            }
            wrapperClassName="ml-8 w-fit justify-self-start overflow-visible"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-[0_12px_24px_rgba(0,102,204,0.22)] transition hover:bg-[#0057ad]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </IconTooltipButton>
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] border border-dashed border-[#cbd5e1] bg-white/48 p-5 text-center text-sm font-bold text-[#8a98a8]">
          Khung trả lời của học viên sẽ hiển thị tại đây.
          <span className="block text-xs">(Tối đa 2000 từ)</span>
        </div>
      )}

      <div className="mt-5 border-t border-[#e7edf4] pt-4">
        <input
          value={question.scriptureReference}
          onChange={(event) =>
            onChange({ ...question, scriptureReference: event.target.value })
          }
          placeholder="Kinh thánh tham khảo..."
          className="h-11 w-full rounded-[13px] border border-[#dce3ed] bg-white/78 px-4 text-sm font-bold outline-none focus:border-[#0066cc]"
        />
      </div>
    </article>
  );
}

export default function AdminExamBuilderContent({
  adminId,
  displayName,
  avatarUrl,
}: AdminExamBuilderContentProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      ...createQuestion("multiple_choice"),
      options: [
        { id: createId("option"), text: "Đức tin là gì?", isCorrect: false },
        {
          id: createId("option"),
          text: "Ý nghĩa của lòng vị tha.",
          isCorrect: true,
        },
      ],
    },
    {
      ...createQuestion("essay"),
      prompt: "Trình bày suy nghĩ của bạn về ý nghĩa của lòng vị tha.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const questionCount = useMemo(() => questions.length, [questions.length]);

  const updateQuestion = (questionId: string, nextQuestion: QuestionDraft) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? nextQuestion : question,
      ),
    );
  };

  const saveExam = async (action: "draft" | "publish") => {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title,
          code,
          category,
          dueDate: dueDate ? dueDate.slice(0, 10) : "",
          description,
          questions: questions.map((question) => ({
            type: question.type,
            prompt: question.prompt,
            helperText: question.helperText,
            scriptureReference: question.scriptureReference,
            allowMultiple: question.allowMultiple,
            options: question.options.map((option) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Không thể lưu bài tập.");
      }

      setMessage(
        action === "draft"
          ? "Đã lưu nháp bài tập."
          : "Đã đăng bài tập thành công.",
      );
      router.push("/admin/exam");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Không thể lưu bài tập.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        activeHref="/admin/exam"
      />

      <section className="min-w-0">
        <div className="relative min-h-[calc(100svh-1.5rem)] overflow-visible rounded-[26px] border border-white/72 bg-[rgba(244,247,255,0.46)] p-4 shadow-[0_34px_120px_rgba(15,23,42,0.16)] backdrop-blur-[10px] sm:p-6 md:min-h-[calc(100svh-2.5rem)] md:p-8 lg:min-h-[calc(100svh-3rem)] lg:rounded-[30px] xl:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_4%,rgba(255,255,232,0.76),transparent_26%),radial-gradient(circle_at_20%_82%,rgba(214,226,255,0.46),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.18),rgba(231,238,255,0.24))]" />

          <div className="relative z-50 mx-auto max-w-5xl overflow-visible">
            <AdminExamBuilderHeader
              isSaving={isSaving}
              onSaveDraft={() => saveExam("draft")}
              onPublish={() => saveExam("publish")}
            />

            {(error || message) && (
              <div
                className={[
                  "mt-5 rounded-2xl border px-5 py-4 text-sm font-bold",
                  error
                    ? "border-[#fecaca] bg-[#fff1f0]/76 text-[#dc2626]"
                    : "border-[#bbf7d0] bg-[#ecfdf3]/76 text-[#15803d]",
                ].join(" ")}
              >
                {error || message}
              </div>
            )}

            <InfoPanel
              title={title}
              setTitle={setTitle}
              code={code}
              setCode={setCode}
              category={category}
              setCategory={setCategory}
              dueDate={dueDate}
              setDueDate={setDueDate}
              description={description}
              setDescription={setDescription}
            />

            <div className="mt-8 flex items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold tracking-[-0.04em] text-[#252b31]">
                Nội dung câu hỏi
              </h2>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-[#667085]">
                {questionCount} câu hỏi
              </span>
            </div>

            <div className="mt-4 grid gap-5">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onChange={(nextQuestion) =>
                    updateQuestion(question.id, nextQuestion)
                  }
                  onRemove={() =>
                    setQuestions((current) =>
                      current.filter((item) => item.id !== question.id),
                    )
                  }
                />
              ))}

              <IconTooltipButton
                label="Thêm câu hỏi mới"
                onClick={() =>
                  setQuestions((current) => [...current, createQuestion()])
                }
                wrapperClassName="w-full overflow-visible"
                className="flex w-full flex-col items-center rounded-[22px] border border-dashed border-[#c8d0dc] bg-white/42 px-6 py-8 text-sm font-extrabold text-[#0066cc] shadow-[0_18px_48px_rgba(31,48,70,0.08)] transition hover:-translate-y-0.5 hover:bg-white/68"
              >
                <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-[0_16px_34px_rgba(0,102,204,0.25)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
                Thêm câu hỏi mới
              </IconTooltipButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
