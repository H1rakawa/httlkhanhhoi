"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/com/admin/AdminSidebar";
import Pagination from "@/com/lib/Pagination";
import {
  adminExamStatusLabels,
  adminExamStatusOptions,
  type AdminExamsResponse,
  type AdminExamItem,
  type AdminExamStatus,
} from "@/com/admin/exam/adminExamData";

type AdminExamContentProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
};

type StatusFilter = "all" | AdminExamStatus;

const PAGE_SIZE = 4;

const statusClassName: Record<AdminExamStatus, string> = {
  ongoing: "bg-[#e8f8ee] text-[#2d8f58]",
  upcoming: "bg-[#fff2c9] text-[#8a6110]",
  ended: "bg-white/82 text-[#667085]",
  draft: "bg-[#e8f2ff] text-[#0066cc]",
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

function SelectCheckbox({
  checked,
  mixed = false,
  label,
  onClick,
}: {
  checked: boolean;
  mixed?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-5 w-5 items-center justify-center rounded-md border transition",
        checked || mixed
          ? "border-[#0066cc] bg-[#0066cc] text-white shadow-[0_8px_18px_rgba(0,102,204,0.22)]"
          : "border-white/80 bg-white/86 text-transparent shadow-inner hover:border-[#0066cc]/50 hover:text-[#0066cc]/55",
      ].join(" ")}
      aria-label={label}
      aria-pressed={checked}
    >
      {mixed ? (
        <span className="h-0.5 w-2.5 rounded-full bg-current" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      )}
    </button>
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

      <Link
        href="/admin/exam/new"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-sm font-extrabold text-white no-underline shadow-[0_18px_42px_rgba(0,102,204,0.24)] transition hover:bg-[#0057ad] sm:w-auto"
      >
        <PlusIcon />
        Thêm bài tập mới
      </Link>
    </header>
  );
}

function AdminExamFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: {
  query: string;
  status: StatusFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const selectedStatusLabel =
    adminExamStatusOptions.find((option) => option.value === status)?.label ??
    "Mọi trạng thái";

  return (
    <section className="liquid-glass mt-6 grid gap-3 rounded-[18px] p-3 lg:grid-cols-[minmax(0,1fr)_auto]">
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

      <div className="relative z-30">
        <button
          type="button"
          onClick={() => setIsStatusOpen((value) => !value)}
          className="flex h-12 w-full items-center justify-between gap-4 rounded-[14px] bg-white px-4 text-sm font-extrabold text-[#3f4750] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_rgba(31,48,70,0.08)] transition hover:bg-[#f8fbff] lg:min-w-[190px]"
          aria-haspopup="listbox"
          aria-expanded={isStatusOpen}
        >
          <span>{selectedStatusLabel}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={[
              "h-4 w-4 transition-transform",
              isStatusOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isStatusOpen && (
          <div
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-[210px] overflow-hidden rounded-[16px] border border-[#e8edf5] bg-white p-1.5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
            role="listbox"
          >
            {adminExamStatusOptions.map((option) => {
              const isActive = option.value === status;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onStatusChange(option.value as StatusFilter);
                    setIsStatusOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-sm font-extrabold transition",
                    isActive
                      ? "bg-[#e8f2ff] text-[#0066cc]"
                      : "text-[#3f4750] hover:bg-[#f3f7fb]",
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
          </div>
        )}
      </div>
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

function AdminExamTable({
  items,
  selectedIds,
  page,
  pageSize,
  total,
  onToggleExam,
  onToggleAll,
  onPageChange,
}: {
  items: AdminExamItem[];
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  onToggleExam: (examId: string) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
}) {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const hasSelection = selectedIds.length > 0;

  return (
    <section className="liquid-glass mt-6 overflow-hidden rounded-[28px]">
      <div className="hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-white/40 bg-white/28 text-xs font-extrabold uppercase tracking-[0.08em] text-[#738095]">
              <th className="w-14 px-6 py-5">
                <SelectCheckbox
                  checked={isAllSelected}
                  mixed={hasSelection && !isAllSelected}
                  label={isAllSelected ? "Bỏ chọn tất cả bài tập" : "Chọn tất cả bài tập"}
                  onClick={onToggleAll}
                />
              </th>
              <th className="px-4 py-5">Tên bài tập</th>
              <th className="w-[132px] px-4 py-5">Hạn nộp</th>
              <th className="w-[155px] px-4 py-5">Trạng thái</th>
              <th className="w-[110px] px-4 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <tr
                  key={item.id}
                  className={[
                    "border-b border-white/36 text-sm font-extrabold text-[#344054] transition-colors last:border-b-0",
                    isSelected
                      ? "bg-[#eaf4ff]/52 hover:bg-[#e0f0ff]/70"
                      : "bg-white/16 hover:bg-white/42",
                  ].join(" ")}
                >
                  <td className="px-6 py-5">
                    <SelectCheckbox
                      checked={isSelected}
                      label={
                        isSelected ? `Bỏ chọn ${item.title}` : `Chọn ${item.title}`
                      }
                      onClick={() => onToggleExam(item.id)}
                    />
                  </td>
                  <td className="px-4 py-5">
                    <div className="min-w-0">
                      <p className="truncate text-base text-[#182230]">{item.title}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">
                        {item.description}
                      </p>
                    </div>
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <article
              key={item.id}
              className={[
                "rounded-[22px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_34px_rgba(31,48,70,0.08)] transition-colors",
                isSelected
                  ? "border-[#0066cc]/30 bg-[#eaf4ff]/58"
                  : "border-white/60 bg-white/34 hover:bg-white/50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <SelectCheckbox
                  checked={isSelected}
                  label={isSelected ? `Bỏ chọn ${item.title}` : `Chọn ${item.title}`}
                  onClick={() => onToggleExam(item.id)}
                />
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

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-extrabold text-[#526579] sm:grid-cols-3">
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
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/36 bg-white/20 px-5 py-4 text-sm font-extrabold text-[#526579] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span>
            {total > 0
              ? `Hiển thị ${(page - 1) * pageSize + 1} - ${
                  (page - 1) * pageSize + items.length
                } của ${total} bài tập`
              : "Hiển thị 0 bài tập"}
          </span>
          {hasSelection && (
            <span className="text-[#0066cc]">
              {selectedIds.length} bài tập đang chọn
            </span>
          )}
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          className="justify-start gap-2 p-0 sm:justify-center"
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}

export default function AdminExamContent({
  adminId,
  displayName,
  avatarUrl,
}: AdminExamContentProps) {
  const [items, setItems] = useState<AdminExamItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExams = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      status,
    });
    if (query.trim()) params.set("q", query.trim());

    try {
      const response = await fetch(`/api/admin/exams?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const data = (await response.json()) as AdminExamsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Không thể tải danh sách bài tập.");
      }

      setItems(data.exams);
      setTotal(data.total);
      setSelectedIds([]);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Không thể tải danh sách bài tập.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, query, status]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => loadExams(controller.signal), 180);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadExams]);

  const handleToggleExam = useCallback((examId: string) => {
    setSelectedIds((current) =>
      current.includes(examId)
        ? current.filter((selectedId) => selectedId !== examId)
        : [...current, examId],
    );
  }, []);

  const handleToggleAllExams = useCallback(() => {
    setSelectedIds((current) =>
      items.length > 0 && current.length === items.length
        ? []
        : items.map((item) => item.id),
    );
  }, [items]);

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
              status={status}
              onQueryChange={(value) => {
                setPage(1);
                setQuery(value);
              }}
              onStatusChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            />
            {error && (
              <div className="mt-5 rounded-2xl border border-[#fecaca] bg-[#fff1f0]/70 px-5 py-4 text-sm font-bold text-[#dc2626]">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="liquid-glass mt-6 rounded-[24px] p-8 text-center text-sm font-extrabold text-[#64748b] lg:rounded-[28px] lg:p-10">
                Đang tải danh sách bài tập...
              </div>
            ) : (
              <AdminExamTable
                items={items}
                selectedIds={selectedIds}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onToggleExam={handleToggleExam}
                onToggleAll={handleToggleAllExams}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
