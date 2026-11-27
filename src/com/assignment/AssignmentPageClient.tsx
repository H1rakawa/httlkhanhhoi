"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import FilterSelect from "@/com/assignment/FilterSelect";
import {
  type AssignmentItem,
  assignmentHref,
  assignmentStatuses,
  formatDueDate,
  statusClasses,
} from "@/com/assignment/assignmentData";

type AssignmentPageClientProps = {
  assignments: AssignmentItem[];
  loadError: string | null;
};

export default function AssignmentPageClient({ assignments, loadError }: AssignmentPageClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [showHistory, setShowHistory] = useState(false);

  const categories = useMemo(
    () => ["Tất cả", ...new Set(assignments.map((assignment) => assignment.category))],
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesQuery =
        !normalizedQuery ||
        [assignment.id, assignment.title, assignment.description ?? "", assignment.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        category === "Tất cả" || assignment.category === category;
      const matchesStatus =
        status === "Tất cả trạng thái" || assignment.status === status;
      const matchesHistory =
        !showHistory ||
        assignment.status === "Đã nộp" ||
        assignment.status === "Đã chấm";

      return matchesQuery && matchesCategory && matchesStatus && matchesHistory;
    });
  }, [assignments, category, query, showHistory, status]);

  const completed = assignments.filter(
    (assignment) => assignment.status === "Đã nộp" || assignment.status === "Đã chấm",
  ).length;
  const urgent = assignments.filter(
    (assignment) =>
      assignment.status === "Trễ hạn" || assignment.status === "Đang thực hiện",
  ).length;
  const graded = assignments.filter((assignment) => assignment.grade != null);
  const average =
    graded.length > 0
      ? (graded.reduce((total, assignment) => total + Number(assignment.grade), 0) / graded.length).toFixed(1)
      : "—";

  return (
    <>
      <section className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl pt-24 md:pt-28">
        <div className="liquid-glass p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">
                <DashboardIcon name="document" className="h-4 w-4" />
                Học tập và rèn luyện
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-normal md:text-6xl">
                Danh sách bài tập
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6368]">
                Theo dõi hành trình học hỏi, suy ngẫm và phục vụ của bạn trong
                một không gian rõ ràng, nhẹ nhàng.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Đã hoàn thành", String(completed)],
                ["Cần chú ý", String(urgent)],
                ["Điểm trung bình", average],
              ].map(([label, value]) => (
                <div key={label} className="liquid-readable px-3 py-5 text-center">
                  <p className="text-2xl font-semibold text-[#0066cc]">{value}</p>
                  <p className="mt-2 text-xs font-medium leading-5 text-[#6e6e73]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-8 w-[calc(100%_-_2rem)] max-w-7xl">
        <div className="liquid-glass p-4 md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <DashboardIcon
                name="document"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e6e73]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên, mã hoặc nội dung bài tập..."
                className="h-12 w-full rounded-full border border-white/90 bg-white/72 pl-11 pr-5 text-sm outline-none focus:border-[#0066cc]"
              />
            </div>
            <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
              <FilterSelect
                ariaLabel="Lọc theo phân loại"
                value={category}
                options={categories}
                onChange={setCategory}
              />
              <FilterSelect
                ariaLabel="Lọc theo trạng thái"
                value={status}
                options={assignmentStatuses}
                onChange={setStatus}
              />
              <button
                type="button"
                onClick={() => setShowHistory((current) => !current)}
                className={[
                  "flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold",
                  showHistory
                    ? "bg-[#0066cc] text-white"
                    : "border border-white/90 bg-white/72 text-[#1d1d1f]",
                ].join(" ")}
              >
                <DashboardIcon name="calendar" className="h-4 w-4" />
                Lịch sử
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-8 md:py-12">
        <div className="liquid-glass overflow-hidden">
          <div className="hidden grid-cols-[0.55fr_2fr_1fr_1fr_1fr_0.55fr] gap-4 border-b border-white/55 bg-white/24 px-7 py-5 text-sm font-semibold text-[#7b8190] lg:grid">
            <span>Mã</span>
            <span>Tên bài tập</span>
            <span>Phân loại</span>
            <span>Trạng thái</span>
            <span>Hạn hoàn thành</span>
            <span className="text-center">Chi tiết</span>
          </div>

          <div className="divide-y divide-white/48">
            {filteredAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={assignmentHref(assignment, assignment.status === "Đã chấm")}
                className="grid gap-5 bg-white/18 px-5 py-6 text-[#1d1d1f] no-underline transition-colors hover:bg-white/34 lg:grid-cols-[0.55fr_2fr_1fr_1fr_1fr_0.55fr] lg:items-center lg:gap-4 lg:px-7"
                aria-label={`${assignment.status === "Đã chấm" ? "Xem kết quả" : "Làm bài"} ${assignment.title}`}
              >
                <p className="text-sm font-semibold text-[#6e6e73]">#{assignment.id}</p>
                <div>
                  <h2 className="text-base font-semibold">{assignment.title}</h2>
                  {assignment.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6e6e73]">
                      {assignment.description}
                    </p>
                  )}
                </div>
                <p className="w-fit rounded-full border border-white bg-white/62 px-3 py-2 text-xs font-semibold text-[#4f5865]">
                  {assignment.category}
                </p>
                <span
                  className={`w-fit rounded-full px-3 py-2 text-xs font-semibold ${statusClasses(assignment.status)}`}
                >
                  {assignment.status}
                </span>
                <div>
                  <p className="text-sm font-semibold">{formatDueDate(assignment.dueDate)}</p>
                  {assignment.grade != null && (
                    <p className="mt-1 text-xs font-semibold text-[#14743a]">
                      Điểm: {assignment.grade}/10
                    </p>
                  )}
                </div>
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#07111f] text-white shadow-[0_10px_24px_rgba(7,17,31,0.18)]"
                  aria-hidden="true"
                >
                  <DashboardIcon name="document" className="h-5 w-5" />
                </span>
              </Link>
            ))}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-semibold">
                {loadError
                  ? "Chưa tải được bài tập"
                  : assignments.length === 0
                    ? "Chưa có bài tập nào được giao"
                    : "Không tìm thấy bài tập phù hợp"}
              </p>
              <p className="mt-2 text-sm text-[#6e6e73]">
                {loadError ||
                  (assignments.length === 0
                    ? "Bài tập mới từ giáo viên sẽ hiện ở đây."
                    : "Hãy thử thay đổi từ khóa hoặc bộ lọc.")}
              </p>
            </div>
          )}
        </div>
      </section>

    </>
  );
}
