"use client";

import { useMemo, useState } from "react";
import AdminSidebar from "@/com/admin/AdminSidebar";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import {
  adminExamItems,
  adminExamStatusLabels,
  adminExamStatusOptions,
  adminExamWeekOptions,
  type AdminExamItem,
  type AdminExamStatus,
} from "@/com/admin/exam/adminExamData";

type AdminExamContentProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
};

type StatusFilter = "all" | AdminExamStatus;

const statusClassName: Record<AdminExamStatus, string> = {
  ongoing: "bg-[#e8f8ee] text-[#2d8f58]",
  upcoming: "bg-[#fff2c9] text-[#8a6110]",
  ended: "bg-white/82 text-[#667085]",
  draft: "bg-[#e8f2ff] text-[#0066cc]",
};

const iconClassName: Record<AdminExamItem["iconTone"], string> = {
  blue: "bg-[#d9ebff] text-[#0066cc]",
  gold: "bg-[#fff1c7] text-[#8a6110]",
  dark: "bg-[#101418] text-white",
};

function PlusIcon() {
  return (
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function AssignmentIcon({ tone }: { tone: AdminExamItem["iconTone"] }) {
  return (
    <span
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        iconClassName[tone],
      ].join(" ")}
    >
      <DashboardIcon name="book" className="h-5 w-5 stroke-[2.1]" />
    </span>
  );
}

function AdminExamHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-[-0.05em] text-[#0f172a] md:text-3xl">
          Quản lý bài tập
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#506070]">
          Quản lý và theo dõi tiến độ các bài tập của cộng đồng.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#070d18] px-5 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(7,13,24,0.22)] transition hover:bg-[#111827] sm:w-auto"
      >
        <PlusIcon />
        Thêm bài tập mới
      </button>
    </header>
  );
}

function AdminExamFilters({
  query,
  week,
  status,
  onQueryChange,
  onWeekChange,
  onStatusChange,
}: {
  query: string;
  week: string;
  status: StatusFilter;
  onQueryChange: (value: string) => void;
  onWeekChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}) {
  return (
    <section className="liquid-glass mt-6 grid gap-3 rounded-[18px] p-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="flex h-12 items-center gap-3 rounded-[14px] bg-white/64 px-4 text-[#8a98a8] shadow-inner">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm kiếm tên bài tập..."
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-[#111827] outline-none placeholder:text-[#8a98a8]"
        />
      </label>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[14px] bg-white/44 px-3 text-sm font-extrabold text-[#637082] shadow-inner sm:min-w-[280px]">
        <span className="hidden text-xs uppercase tracking-[0.08em] sm:inline">
          Lọc theo:
        </span>
        <select
          value={week}
          onChange={(event) => onWeekChange(event.target.value)}
          className="h-12 rounded-[12px] bg-white/84 px-3 text-sm font-extrabold text-[#3f4750] outline-none"
          aria-label="Lọc theo tuần"
        >
          {adminExamWeekOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        className="h-12 rounded-[14px] bg-white/86 px-4 text-sm font-extrabold text-[#3f4750] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(31,48,70,0.08)] outline-none"
        aria-label="Lọc theo trạng thái"
      >
        {adminExamStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}

function AdminExamActionButton({ item }: { item: AdminExamItem }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] transition hover:bg-white/70 hover:text-[#0f172a]"
      aria-label={`Mở thao tác cho ${item.title}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="5" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="12" cy="19" r="1.8" />
      </svg>
    </button>
  );
}

function AdminExamTable({ items }: { items: AdminExamItem[] }) {
  return (
    <section className="liquid-glass mt-6 overflow-hidden rounded-[28px]">
      <div className="hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-white/40 bg-white/28 text-xs font-extrabold uppercase tracking-[0.08em] text-[#738095]">
              <th className="w-14 px-6 py-5">
                <span className="block h-4 w-4 rounded bg-white/88 shadow-inner" />
              </th>
              <th className="px-4 py-5">Tên bài tập</th>
              <th className="w-[120px] px-4 py-5">Tuần</th>
              <th className="w-[132px] px-4 py-5">Hạn nộp</th>
              <th className="w-[155px] px-4 py-5">Trạng thái</th>
              <th className="w-[110px] px-4 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/36 bg-white/16 text-sm font-extrabold text-[#344054] last:border-b-0"
              >
                <td className="px-6 py-5">
                  <span className="block h-4 w-4 rounded bg-white/86 shadow-inner" />
                </td>
                <td className="px-4 py-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <AssignmentIcon tone={item.iconTone} />
                    <div className="min-w-0">
                      <p className="truncate text-base text-[#182230]">{item.title}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-[#526579]">{item.week}</td>
                <td className="px-4 py-5 text-[#526579]">{item.dueDate}</td>
                <td className="px-4 py-5">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold",
                      statusClassName[item.status],
                    ].join(" ")}
                  >
                    {adminExamStatusLabels[item.status]}
                  </span>
                </td>
                <td className="px-4 py-5 text-center">
                  <AdminExamActionButton item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[22px] border border-white/60 bg-white/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_34px_rgba(31,48,70,0.08)]"
          >
            <div className="flex items-start gap-3">
              <AssignmentIcon tone={item.iconTone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-[#182230]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs font-bold text-[#667085]">
                  {item.description}
                </p>
              </div>
              <AdminExamActionButton item={item} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-extrabold text-[#526579] sm:grid-cols-4">
              <span className="rounded-2xl bg-white/58 px-3 py-2">
                Tuần
                <span className="mt-1 block text-[#182230]">{item.week}</span>
              </span>
              <span className="rounded-2xl bg-white/58 px-3 py-2">
                Hạn nộp
                <span className="mt-1 block text-[#182230]">{item.dueDate}</span>
              </span>
              <span className="rounded-2xl bg-white/58 px-3 py-2">
                Hoàn thành
                <span className="mt-1 block text-[#182230]">
                  {item.completed}/{item.participants}
                </span>
              </span>
              <span className="rounded-2xl bg-white/58 px-3 py-2">
                Trạng thái
                <span
                  className={[
                    "mt-1 block w-fit rounded-full px-2.5 py-1",
                    statusClassName[item.status],
                  ].join(" ")}
                >
                  {adminExamStatusLabels[item.status]}
                </span>
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/36 bg-white/20 px-5 py-4 text-sm font-extrabold text-[#526579] sm:flex-row sm:items-center sm:justify-between">
        <span>Hiển thị 1 - {items.length} của 12 bài tập</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/48 text-[#98a2b3]"
            aria-label="Trang trước"
          >
            ‹
          </button>
          {[1, 2, 3].map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full transition",
                pageNumber === 1
                  ? "bg-white text-[#111827] shadow-[0_10px_24px_rgba(31,48,70,0.12)]"
                  : "text-[#526579] hover:bg-white/54",
              ].join(" ")}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/48 text-[#526579]"
            aria-label="Trang sau"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default function AdminExamContent({
  adminId,
  displayName,
  avatarUrl,
}: AdminExamContentProps) {
  const [query, setQuery] = useState("");
  const [week, setWeek] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return adminExamItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);
      const matchesWeek = week === "all" || item.week === week;
      const matchesStatus = status === "all" || item.status === status;

      return matchesQuery && matchesWeek && matchesStatus;
    });
  }, [query, status, week]);

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        activeHref="/admin/exam"
      />

      <section className="min-w-0">
        <div className="relative min-h-[calc(100svh-1.5rem)] overflow-hidden rounded-[26px] border border-white/72 bg-[rgba(237,246,226,0.42)] p-3 shadow-[0_34px_120px_rgba(15,23,42,0.16)] backdrop-blur-[10px] sm:p-5 md:min-h-[calc(100svh-2.5rem)] md:p-7 lg:min-h-[calc(100svh-3rem)] lg:rounded-[30px] lg:p-8 xl:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_36%_0%,rgba(255,255,218,0.76),transparent_25%),radial-gradient(circle_at_75%_28%,rgba(196,226,160,0.34),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(22,56,20,0.12))]" />
          <div className="relative z-10">
            <AdminExamHeader />
            <AdminExamFilters
              query={query}
              week={week}
              status={status}
              onQueryChange={setQuery}
              onWeekChange={setWeek}
              onStatusChange={setStatus}
            />
            <AdminExamTable items={filteredItems} />
          </div>
        </div>
      </section>
    </div>
  );
}
