"use client";

import { useCallback, useEffect, useState } from "react";
import Pagination from "@/com/lib/Pagination";
import { SearchIcon } from "@/com/admin/pray/AdminPrayerIcons";
import AdminContactList from "./AdminContactList";
import {
  contactStatusFilters,
  emptyContactCounts,
  type ContactListResponse,
  type ContactMessage,
  type ContactStatus,
  type ContactStatusFilter,
} from "./adminContactData";

const PAGE_SIZE = 10;

const statCards: Array<{
  value: ContactStatusFilter;
  label: string;
  tone: "blue" | "gold" | "green" | "slate";
}> = [
  { value: "all", label: "Tổng lời nhắn", tone: "blue" },
  { value: "new", label: "Chưa đọc", tone: "gold" },
  { value: "replied", label: "Đã phản hồi", tone: "green" },
  { value: "archived", label: "Lưu trữ", tone: "slate" },
];

const toneClassName = {
  blue: "text-[#0c1322]",
  gold: "text-[#8a6110]",
  green: "text-[#2d8f58]",
  slate: "text-[#667085]",
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Đã có lỗi xảy ra.");
  return data;
}

export default function AdminContactContent() {
  const [status, setStatus] = useState<ContactStatusFilter>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ContactListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (status !== "all") params.set("status", status);
    if (debouncedQuery) params.set("q", debouncedQuery);

    fetch(`/api/admin/contact?${params.toString()}`, { signal: controller.signal })
      .then((response) => readJson<ContactListResponse>(response))
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          fetchError instanceof Error ? fetchError.message : "Không thể tải hộp thư.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, page, reloadKey, status]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const updateStatus = useCallback(
    async (message: ContactMessage, nextStatus: ContactStatus) => {
      setBusyId(message.id);
      try {
        const result = await readJson<{ message: ContactMessage }>(
          await fetch(`/api/admin/contact/${message.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          }),
        );
        // Cập nhật tại chỗ để lời nhắn đang mở không biến mất khỏi danh sách
        // đang lọc; danh sách sẽ được lọc lại ở lần tải kế tiếp.
        setData((current) => {
          if (!current) return current;
          const counts = { ...current.counts };
          counts[message.status] = Math.max(counts[message.status] - 1, 0);
          counts[result.message.status] += 1;
          return {
            ...current,
            counts,
            messages: current.messages.map((item) =>
              item.id === result.message.id ? result.message : item,
            ),
          };
        });
      } catch (updateError) {
        setError(
          updateError instanceof Error ? updateError.message : "Không thể cập nhật.",
        );
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const deleteMessage = useCallback(
    async (message: ContactMessage) => {
      if (
        !window.confirm(
          `Xoá vĩnh viễn lời nhắn của ${message.name}? Thao tác này không thể hoàn tác.`,
        )
      ) {
        return;
      }
      setBusyId(message.id);
      try {
        await readJson(
          await fetch(`/api/admin/contact/${message.id}`, { method: "DELETE" }),
        );
        if (data && data.messages.length === 1 && page > 1) setPage(page - 1);
        reload();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error ? deleteError.message : "Không thể xoá lời nhắn.",
        );
      } finally {
        setBusyId(null);
      }
    },
    [data, page, reload],
  );

  const counts = data?.counts ?? emptyContactCounts();
  const messages = data?.messages ?? [];
  const total = data?.total ?? 0;

  const changeStatus = (value: ContactStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <>
      <header className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7d8798]">
          <span>Quản trị</span>
          <span>/</span>
          <span className="text-[#101828]">Liên hệ</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-[#0f172a] md:text-3xl">
          Hộp thư liên hệ
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#506070]">
          Đọc và xử lý các lời nhắn gửi từ trang Liên hệ.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card) => {
          const isActive = status === card.value;
          return (
            <button
              key={card.value}
              type="button"
              onClick={() => changeStatus(card.value)}
              aria-pressed={isActive}
              className={[
                "flex min-h-[112px] flex-col justify-center rounded-[24px] border px-6 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_42px_rgba(31,48,70,0.08)] backdrop-blur-xl transition",
                isActive
                  ? "border-[#0066cc]/35 bg-white/78"
                  : "border-white/64 bg-white/50 hover:bg-white/64",
              ].join(" ")}
            >
              <span className="text-xs font-black uppercase leading-4 text-[#7f8796]">
                {card.label}
              </span>
              <span
                className={[
                  "mt-2 text-4xl font-black tracking-normal",
                  toneClassName[card.tone],
                ].join(" ")}
              >
                {counts[card.value].toLocaleString("vi-VN")}
              </span>
            </button>
          );
        })}
      </section>

      <section className="liquid-glass mt-6 rounded-[24px] p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-white/64 px-4 text-[#8a98a8] shadow-inner">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại hoặc nội dung..."
              aria-label="Tìm kiếm lời nhắn"
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-extrabold text-[#111827] outline-none placeholder:text-[#929baa]"
            />
          </label>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Lọc theo trạng thái"
          >
            {contactStatusFilters.map((filter) => {
              const isActive = status === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => changeStatus(filter.value)}
                  className={[
                    "flex h-10 items-center gap-2 rounded-[12px] border px-3.5 text-sm font-extrabold transition",
                    isActive
                      ? "border-[#101828] bg-[#101828] text-white"
                      : "border-white/70 bg-white text-[#3f4750] hover:bg-[#f8fbff]",
                  ].join(" ")}
                >
                  {filter.label}
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[11px]",
                      isActive ? "bg-white/20" : "bg-[#eef3fa] text-[#667085]",
                    ].join(" ")}
                  >
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center justify-between gap-3 rounded-[16px] border border-[#f3c0c0] bg-[#fff1f1]/90 px-4 py-3 text-sm font-bold text-[#a12c2c]"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              reload();
            }}
            className="shrink-0 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      <section className="liquid-glass mt-6 overflow-hidden rounded-[28px]">
        <AdminContactList
          messages={messages}
          isLoading={isLoading && !data}
          busyId={busyId}
          onUpdateStatus={updateStatus}
          onDelete={deleteMessage}
        />
        <div className="flex flex-col gap-4 border-t border-white/36 bg-white/20 px-5 py-4 text-sm font-extrabold text-[#526579] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {total > 0
              ? `Hiển thị ${(page - 1) * PAGE_SIZE + 1} - ${(page - 1) * PAGE_SIZE + messages.length} của ${total} lời nhắn`
              : "Không có lời nhắn"}
          </span>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            className="justify-start gap-2 p-0 sm:justify-center"
            onPageChange={setPage}
          />
        </div>
      </section>
    </>
  );
}
