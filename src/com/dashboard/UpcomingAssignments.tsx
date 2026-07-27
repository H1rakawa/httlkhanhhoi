"use client";

import DashboardIcon from "@/com/dashboard/DashboardIcon";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ApiAssignment = {
  id: number | string;
  title: string;
  description: string | null;
  category: string | null;
  week_number: number | null;
  due_date: string | null;
  submissions?: Array<{
    status: "draft" | "submitted" | "graded";
    grade: number | null;
  }>;
};

type UpcomingAssignment = {
  id: string;
  title: string;
  subtitle: string;
  status: "Chưa làm" | "Đang làm" | "Đã nộp" | "Đã chấm";
  icon: "book" | "document" | "group";
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseDueDate(date: string | null) {
  if (!date) return null;
  const dueDate = new Date(`${date}T12:00:00`);
  return Number.isNaN(dueDate.getTime()) ? null : dueDate;
}

function isDueWithinNextWeek(date: string | null) {
  const dueDate = parseDueDate(date);
  if (!dueDate) return false;

  const today = startOfToday();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return dueDate >= today && dueDate <= nextWeek;
}

function formatDueText(date: string | null) {
  const dueDate = parseDueDate(date);
  if (!dueDate) return "Chưa có hạn hoàn thành";

  const today = startOfToday();
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((dueDay.getTime() - today.getTime()) / 86400000);

  if (dayDiff === 0) return "Hạn hôm nay";
  if (dayDiff === 1) return "Hạn ngày mai";

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dueDate);

  return `Còn ${dayDiff} ngày · ${formattedDate}`;
}

function statusFromApi(assignment: ApiAssignment): UpcomingAssignment["status"] {
  const submission = assignment.submissions?.[0];
  if (submission?.status === "graded") return "Đã chấm";
  if (submission?.status === "submitted") return "Đã nộp";
  if (submission?.status === "draft") return "Đang làm";
  return "Chưa làm";
}

function iconFromApi(assignment: ApiAssignment): UpcomingAssignment["icon"] {
  const source = `${assignment.category || ""} ${assignment.title}`.toLowerCase();
  if (source.includes("nhóm") || source.includes("cộng đồng")) return "group";
  if (source.includes("kinh thánh") || source.includes("bible")) return "book";
  return "document";
}

function mapAssignment(assignment: ApiAssignment): UpcomingAssignment {
  return {
    id: String(assignment.id),
    title: assignment.title,
    subtitle: `Hạn hoàn thành: ${formatDueText(assignment.due_date)}`,
    status: statusFromApi(assignment),
    icon: iconFromApi(assignment),
  };
}

export default function UpcomingAssignments() {
  const [assignments, setAssignments] = useState<UpcomingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/assignments?dueWithinDays=7", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Không thể tải bài tập sắp tới.");
        }

        if (!Array.isArray(payload)) {
          throw new Error("Dữ liệu bài tập chưa đúng định dạng.");
        }

        if (!isMounted) return;

        setAssignments(
          payload
            .filter((assignment: ApiAssignment) =>
              isDueWithinNextWeek(assignment.due_date),
            )
            .map(mapAssignment),
        );
      } catch (error) {
        if (!isMounted) return;
        setAssignments([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải bài tập sắp tới.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid flex-1 gap-4">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="liquid-glass-item flex animate-pulse items-center gap-4 border-2 border-white/80 p-4"
            >
              <div className="h-11 w-11 rounded-[8px] bg-[#e8eef7]" />
              <div className="flex-1">
                <div className="h-4 w-2/3 rounded-full bg-[#e8eef7]" />
                <div className="mt-3 h-3 w-1/2 rounded-full bg-[#eef2f7]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="liquid-glass-item flex flex-1 flex-col justify-center border-2 border-white/80 p-5 text-center">
          <p className="text-base font-semibold">Chưa tải được bài tập</p>
          <p className="mt-2 text-sm leading-6 text-[#6e6e73]">{errorMessage}</p>
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <div className="liquid-glass-item flex flex-1 flex-col justify-center border-2 border-white/80 p-5 text-center">
          <p className="text-base font-semibold">Không có bài tập sắp hết hạn</p>
          <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
            Hiện chưa có bài tập nào kết thúc trong 7 ngày tới.
          </p>
        </div>
      );
    }

    return (
      <div className="grid flex-1 gap-4">
        {assignments.map((assignment) => (
          <article
            key={assignment.id}
            className={[
              "liquid-glass-item flex flex-col items-start gap-4 border-2 border-white/80 p-4 sm:flex-row sm:items-center",
              assignment.status === "Đã nộp" || assignment.status === "Đã chấm"
                ? "border-l-4 border-l-[#0066cc]"
                : "border-l-4 border-l-[#cfd8e4]",
            ].join(" ")}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f5fb] text-[#0066cc]">
              <DashboardIcon name={assignment.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold">{assignment.title}</h3>
              <p className="mt-1 text-sm text-[#8a8a8f]">{assignment.subtitle}</p>
            </div>
            <span
              className={[
                "shrink-0 self-start rounded-full px-4 py-2 text-xs font-semibold sm:self-auto",
                assignment.status === "Đã nộp" || assignment.status === "Đã chấm"
                  ? "bg-[#eef5ff] text-[#0066cc]"
                  : "bg-[#f1f1f4] text-[#6e6e73]",
              ].join(" ")}
            >
              {assignment.status}
            </span>
          </article>
        ))}
      </div>
    );
  }, [assignments, errorMessage, isLoading]);

  return (
    <section className="liquid-readable flex h-full flex-col p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bài tập sắp tới</h2>
        <Link href="/assignment" className="text-sm font-medium text-[#0066cc] hover:underline">
          Xem tất cả
        </Link>
      </div>
      {content}
    </section>
  );
}
