"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/com/admin/AdminSidebar";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import type { GradingSubmission } from "@/lib/admin/grading";
import AdminGradingDrawer from "./AdminGradingDrawer";
import { adminExamStatusLabels, type AdminExamStatus } from "./adminExamData";

type AdminExamDetailContentProps = {
  examId: string;
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
  viewerRole?: string | null;
};

type ExamQuestion = {
  id: string;
  type: "multiple_choice" | "essay";
  prompt: string;
  helperText: string | null;
  scriptureReference: string | null;
  answerHint: string | null;
  allowMultiple: boolean;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
};

type ExamStudent = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: "draft" | "submitted" | "graded";
  grade: number | null;
  submittedAt: string | null;
};

type ExamDetailResponse = {
  assignment: {
    id: string;
    rawId: number;
    title: string;
    description: string;
    code: string | null;
    category: string;
    weekNumber: number | null;
    dueDate: string | null;
    status: AdminExamStatus;
    attachment: {
      title: string;
      url: string;
      mimeType: string | null;
      mediaKind: string | null;
      sizeBytes: number | null;
    } | null;
    questions: ExamQuestion[];
  };
  stats: {
    totalStudents: number;
    completed: number;
    pending: number;
  };
  students: ExamStudent[];
  error?: string;
};

const submissionStatusLabels: Record<ExamStudent["status"], string> = {
  draft: "Đang làm",
  submitted: "Chờ chấm",
  graded: "Đã chấm",
};

const submissionStatusClassNames: Record<ExamStudent["status"], string> = {
  draft: "bg-[#edf2fb] text-[#526174]",
  submitted: "bg-[#ffe4a8] text-[#805500]",
  graded: "bg-[#dcfae6] text-[#14743a]",
};

function formatDate(value: string | null) {
  if (!value) return "Chưa đặt hạn";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatSize(sizeBytes: number | null) {
  if (!sizeBytes) return "";
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function fileKindLabel(attachment: ExamDetailResponse["assignment"]["attachment"]) {
  if (!attachment) return "";
  const mimeType = attachment.mimeType || "";
  const mediaKind = attachment.mediaKind || "";

  if (mimeType.includes("audio") || mediaKind === "audio") return "MP3";
  if (mimeType.includes("video") || mediaKind === "video") return "Video";
  if (mimeType.includes("pdf") || attachment.url.toLowerCase().includes(".pdf")) {
    return "PDF";
  }

  return "Tệp";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function ResourceIcon({ kind }: { kind: string }) {
  const color =
    kind === "PDF"
      ? "bg-[#fff1f0] text-[#d92d20]"
      : kind === "MP3"
        ? "bg-[#fff5dc] text-[#9a6700]"
        : "bg-[#eaf3ff] text-[#0066cc]";

  return (
    <span
      className={[
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]",
        color,
      ].join(" ")}
    >
      <DashboardIcon name={kind === "MP3" ? "upload" : "document"} className="h-5 w-5" />
    </span>
  );
}

function LoadingView() {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-[30px] border border-white/72 bg-white/48 p-8 text-center shadow-[0_34px_100px_rgba(31,48,70,0.14)] backdrop-blur-2xl">
      <div>
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-3 border-[#d7deea] border-t-[#0f172a]" />
        <p className="mt-5 text-sm font-extrabold text-[#526174]">
          Đang tải giao diện quản lý bài tập...
        </p>
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="rounded-[26px] border border-[#fecaca] bg-[#fff1f0]/72 p-6 text-sm font-bold text-[#b42318] shadow-[0_22px_54px_rgba(31,48,70,0.12)] backdrop-blur-xl">
      {message}
    </div>
  );
}

export default function AdminExamDetailContent({
  examId,
  adminId,
  displayName,
  avatarUrl,
  viewerRole,
}: AdminExamDetailContentProps) {
  const [detail, setDetail] = useState<ExamDetailResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetail() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/admin/exams/${encodeURIComponent(examId)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as ExamDetailResponse;

        if (!response.ok) {
          throw new Error(data.error || "Không thể tải chi tiết bài tập.");
        }

        setDetail(data);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Không thể tải chi tiết bài tập.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDetail();

    return () => controller.abort();
  }, [examId]);

  const completionRate = useMemo(() => {
    if (!detail || detail.stats.totalStudents === 0) return 0;
    return Math.round((detail.stats.completed / detail.stats.totalStudents) * 100);
  }, [detail]);

  const [gradingId, setGradingId] = useState<string | null>(null);
  // Chờ chấm lên đầu, rồi tới đã chấm, cuối cùng là đang làm.
  const students = useMemo(() => {
    const order = { submitted: 0, graded: 1, draft: 2 } as const;
    return (detail?.students ?? [])
      .slice()
      .sort((first, second) => order[first.status] - order[second.status]);
  }, [detail]);
  const waiting = students.filter((student) => student.status === "submitted").length;

  const applyGrade = (saved: GradingSubmission) => {
    setDetail((current) =>
      current
        ? {
            ...current,
            students: current.students.map((student) =>
              student.id === String(saved.id)
                ? { ...student, status: saved.status, grade: saved.grade }
                : student,
            ),
          }
        : current,
    );
    setGradingId(null);
  };

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        role={viewerRole}
        activeHref="/admin/assignment"
      />

      <section className="min-w-0">
        <div className="relative min-h-[calc(100svh-1.5rem)] overflow-hidden rounded-[26px] border border-white/72 bg-[rgba(241,244,251,0.56)] p-3 shadow-[0_34px_120px_rgba(15,23,42,0.16)] backdrop-blur-[10px] sm:p-5 md:min-h-[calc(100svh-2.5rem)] md:p-7 lg:min-h-[calc(100svh-3rem)] lg:rounded-[30px] lg:p-8 xl:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(255,249,232,0.78),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(77,96,132,0.08))]" />
          <div className="relative z-10">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/admin/assignment"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-extrabold text-[#465467] no-underline shadow-[0_12px_28px_rgba(31,48,70,0.1)] transition hover:bg-white"
              >
                <span aria-hidden="true">←</span>
                Danh sách bài tập
              </Link>
            </div>

            {isLoading && <LoadingView />}
            {!isLoading && error && <ErrorView message={error} />}
            {!isLoading && detail && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
                <div className="grid gap-7">
                  <article className="rounded-[30px] border border-white/74 bg-white/62 p-6 shadow-[0_28px_80px_rgba(31,48,70,0.13)] backdrop-blur-2xl md:p-8">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold text-[#667085]">
                      <span className="rounded-full bg-[#ffd77a] px-4 py-2 text-[#7a5300]">
                        {detail.assignment.category}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DashboardIcon name="calendar" className="h-4 w-4" />
                        Hạn nộp: {formatDate(detail.assignment.dueDate)}
                      </span>
                      <span className="rounded-full bg-[#edf2fb] px-3 py-1.5 text-[#526174]">
                        {adminExamStatusLabels[detail.assignment.status]}
                      </span>
                    </div>
                    <h1 className="mt-6 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] text-[#101418] md:text-5xl">
                      {detail.assignment.title}
                    </h1>
                    <p className="mt-6 max-w-3xl text-base font-bold leading-8 text-[#475467]">
                      {detail.assignment.description}
                    </p>
                    <p className="mt-5 max-w-3xl text-sm font-bold leading-7 text-[#475467]">
                      Yêu cầu: Học viên hoàn thành các câu hỏi bên dưới trước hạn nộp.
                      Ban mục vụ theo dõi tiến độ và chấm bài ở cột bên phải.
                    </p>
                  </article>

                  <section>
                    <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[#101418]">
                      <DashboardIcon name="book" className="h-5 w-5" />
                      Tài liệu tham khảo
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {detail.assignment.attachment ? (
                        <a
                          href={detail.assignment.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 rounded-[18px] border border-white/70 bg-white/70 p-4 text-[#101418] no-underline shadow-[0_20px_48px_rgba(31,48,70,0.1)] transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          <ResourceIcon kind={fileKindLabel(detail.assignment.attachment)} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-black">
                              {detail.assignment.attachment.title}
                            </span>
                            <span className="mt-1 block text-xs font-bold text-[#667085]">
                              {fileKindLabel(detail.assignment.attachment)}
                              {formatSize(detail.assignment.attachment.sizeBytes)
                                ? ` • ${formatSize(detail.assignment.attachment.sizeBytes)}`
                                : ""}
                            </span>
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9e2ef] bg-white text-[#667085]">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <div className="rounded-[18px] border border-white/70 bg-white/52 p-5 text-sm font-bold text-[#667085] shadow-[0_20px_48px_rgba(31,48,70,0.08)]">
                          Chưa có tài liệu đính kèm cho bài tập này.
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-[30px] border border-white/74 bg-white/64 p-6 shadow-[0_28px_80px_rgba(31,48,70,0.13)] backdrop-blur-2xl md:p-8">
                    <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[#101418]">
                      <DashboardIcon name="document" className="h-5 w-5" />
                      Câu hỏi bài tập
                    </h2>
                    <div className="mt-7 grid gap-6">
                      {detail.assignment.questions.length > 0 ? (
                        detail.assignment.questions.map((question, index) => (
                          <article key={question.id}>
                            <h3 className="text-sm font-black leading-6 text-[#101418]">
                              Câu {index + 1}: {question.prompt}
                            </h3>
                            {question.helperText && (
                              <p className="mt-1 text-xs font-bold text-[#667085]">
                                {question.helperText}
                              </p>
                            )}
                            {question.type === "multiple_choice" ? (
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {question.options.map((option) => (
                                  <div
                                    key={option.text}
                                    className={[
                                      "flex min-h-14 items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-bold text-[#344054]",
                                      option.isCorrect
                                        ? "border-[#c69b43]/50 bg-[#fff7df]"
                                        : "border-[#e5eaf2] bg-white/64",
                                    ].join(" ")}
                                  >
                                    <span
                                      className={[
                                        "h-5 w-5 rounded-full border",
                                        option.isCorrect
                                          ? "border-[#b4862d] bg-[#ffe3a3]"
                                          : "border-[#c9d2df]",
                                      ].join(" ")}
                                    />
                                    {option.text}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-4 min-h-30 rounded-[14px] border border-[#e2e8f0] bg-[#eef2ff]/72 p-4 text-sm font-bold text-[#8a94a6]">
                                Câu trả lời dạng tự luận của học viên sẽ hiển thị trong
                                phần bài nộp.
                              </div>
                            )}
                          </article>
                        ))
                      ) : (
                        <p className="text-sm font-bold text-[#667085]">
                          Bài tập này chưa có câu hỏi.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                <aside className="grid h-fit gap-5 xl:sticky xl:top-6">
                  <section className="rounded-[22px] border border-white/74 bg-white/68 p-5 shadow-[0_24px_64px_rgba(31,48,70,0.12)] backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#667085]">
                        Thống kê
                      </h2>
                      <DashboardIcon name="dashboard" className="h-5 w-5 text-[#936f20]" />
                    </div>
                    <div className="mt-5 flex items-end justify-between">
                      <p className="text-sm font-bold text-[#475467]">Tổng số học viên</p>
                      <p className="text-3xl font-black tracking-[-0.04em]">
                        {detail.stats.totalStudents}
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#8a94a6]">
                          Đã hoàn thành
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#b88622]">
                          {detail.stats.completed}
                          <span className="ml-1 text-xs font-bold text-[#667085]">
                            ({completionRate}%)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#8a94a6]">
                          Chưa hoàn thành
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#101418]">
                          {detail.stats.pending}
                          <span className="ml-1 text-xs font-bold text-[#667085]">
                            ({Math.max(100 - completionRate, 0)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8eef8]">
                      <div
                        className="h-full rounded-full bg-[#b88622]"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-bold italic text-[#667085]">
                      Đã hoàn thành {completionRate}% chỉ tiêu bài tập.
                    </p>
                  </section>

                  <section className="rounded-[22px] border border-white/74 bg-white/68 p-5 shadow-[0_24px_64px_rgba(31,48,70,0.12)] backdrop-blur-2xl">
                    <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[#101418]">
                      <DashboardIcon name="community" className="h-5 w-5" />
                      Học viên
                    </h2>
                    <p className="mt-1 text-xs font-bold text-[#667085]">
                      Bấm vào học viên để xem bài và chấm điểm.
                    </p>
                    <div className="mt-4 grid grid-cols-[1fr_auto] border-b border-[#e8edf5] pb-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#667085]">
                      <span>Học viên</span>
                      <span>Trạng thái</span>
                    </div>
                    <div className="grid max-h-[460px] gap-1 overflow-y-auto py-3">
                      {students.length > 0 ? (
                        students.map((student) => (
                          <button
                            type="button"
                            key={student.id}
                            onClick={() => setGradingId(student.id)}
                            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[12px] p-1.5 text-left transition hover:bg-[#f2f5fb]"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111827] text-xs font-black text-white">
                                {student.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={student.avatarUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  initials(student.name)
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-black text-[#101418]">
                                  {student.name}
                                </span>
                                {student.submittedAt && (
                                  <span className="block text-[11px] font-bold text-[#8a94a6]">
                                    {formatDate(student.submittedAt)}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-[11px] font-black",
                                submissionStatusClassNames[student.status],
                              ].join(" ")}
                            >
                              {student.status === "graded" && student.grade != null
                                ? `${student.grade}/10`
                                : submissionStatusLabels[student.status]}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="py-4 text-sm font-bold text-[#667085]">
                          Chưa có học viên nộp bài.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-[#e8edf5] pt-4 text-xs font-bold text-[#667085]">
                      <span>{waiting} bài chờ chấm</span>
                      <span>
                        {students.filter((student) => student.status === "graded").length}/
                        {students.length} đã chấm
                      </span>
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </div>
        </div>
      </section>
      {gradingId && (
        <AdminGradingDrawer
          key={gradingId}
          examId={examId}
          submissionId={gradingId}
          onClose={() => setGradingId(null)}
          onSaved={applyGrade}
        />
      )}
    </div>
  );
}
