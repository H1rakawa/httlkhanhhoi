"use client";

import { toast } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Pagination from "@/com/lib/Pagination";
import {
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  AdminPanel,
  AdminSelect,
  AdminStatCards,
  AdminToolbar,
  Pill,
  primaryButtonClassName,
  secondaryButtonClassName,
  smallButtonClassName,
} from "@/com/admin/ui/AdminUi";
import { adminFetch, formatVnDate, formatVnDateTime } from "@/com/admin/ui/adminClient";
import { EVENT_STATUS_LABELS, eventStatusClassName, type AdminEvent } from "@/com/admin/events/adminEventData";
import AdminTestimonyForm, { type TestimonyFormValues } from "./AdminTestimonyForm";
import {
  TESTIMONY_STATUS_LABELS,
  testimonyStatusClassName,
  type AdminTestimony,
  type AdminTestimonyStatus,
} from "./adminTestimonyData";

const PAGE_SIZE = 8;
const STATUS_ORDER: Record<AdminTestimonyStatus, number> = { pending: 0, approved: 1, rejected: 2 };

export default function AdminPreachoutContent({
  initialTestimonies,
  outreachEvents,
  resourceCounts,
  loadError,
}: {
  initialTestimonies: AdminTestimony[];
  outreachEvents: AdminEvent[];
  resourceCounts: { total: number; published: number };
  loadError: string | null;
}) {
  const [testimonies, setTestimonies] = useState(initialTestimonies);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AdminTestimonyStatus>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminTestimony | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testimonies
      .filter(
        (item) =>
          (!q || `${item.name} ${item.role ?? ""} ${item.quote} ${item.eventTitle ?? ""}`.toLowerCase().includes(q)) &&
          (status === "all" || item.status === status),
      )
      .sort((a, b) =>
        a.status !== b.status ? STATUS_ORDER[a.status] - STATUS_ORDER[b.status] : b.createdAt.localeCompare(a.createdAt),
      );
  }, [testimonies, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const upcomingOutreach = outreachEvents
    .filter((event) => new Date(event.endsAt ?? event.startsAt).getTime() >= now && event.status !== "cancelled")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const outreachRegistered = upcomingOutreach.reduce((sum, event) => sum + event.registered, 0);

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setPage(1);
    setter(value);
  };

  const replace = (testimony: AdminTestimony) =>
    setTestimonies((current) =>
      current.some((item) => item.id === testimony.id)
        ? current.map((item) => (item.id === testimony.id ? testimony : item))
        : [testimony, ...current],
    );

  const fail = (title: string, error: unknown) =>
    toast.danger(title, {
      description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      timeout: 4000,
    });

  const save = async (values: TestimonyFormValues) => {
    setBusy(true);
    try {
      const isNew = editing === "new";
      const { testimony } = await adminFetch<{ testimony: AdminTestimony }>(
        isNew ? "/api/admin/testimonies" : `/api/admin/testimonies/${(editing as AdminTestimony).id}`,
        { method: isNew ? "POST" : "PATCH", body: values },
      );
      replace(testimony);
      setEditing(null);
      toast.success("Đã lưu lời làm chứng", { timeout: 3000 });
    } catch (error) {
      fail("Chưa lưu được", error);
    } finally {
      setBusy(false);
    }
  };

  const setTestimonyStatus = async (testimony: AdminTestimony, next: AdminTestimonyStatus) => {
    setBusyIds((current) => [...current, testimony.id]);
    try {
      const { testimony: updated } = await adminFetch<{ testimony: AdminTestimony }>(
        `/api/admin/testimonies/${testimony.id}`,
        { method: "PATCH", body: { quick: true, status: next } },
      );
      replace(updated);
      toast.success(`${updated.name} → ${TESTIMONY_STATUS_LABELS[next]}`, { timeout: 3000 });
    } catch (error) {
      fail("Chưa cập nhật được", error);
    } finally {
      setBusyIds((current) => current.filter((id) => id !== testimony.id));
    }
  };

  const remove = async (testimony: AdminTestimony) => {
    setBusy(true);
    try {
      await adminFetch(`/api/admin/testimonies/${testimony.id}`, { method: "DELETE" });
      setTestimonies((current) => current.filter((item) => item.id !== testimony.id));
      setEditing(null);
      toast.success("Đã xoá lời làm chứng", { timeout: 3000 });
    } catch (error) {
      fail("Chưa xoá được", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        crumb="Truyền giảng"
        title="Quản lý Truyền giảng"
        description="Duyệt lời làm chứng và theo dõi các hoạt động truyền giảng hiển thị ở trang /preachout."
        action={
          <>
            <Link href="/preachout" target="_blank" className={`${secondaryButtonClassName} no-underline`}>
              Xem trang
            </Link>
            <button type="button" onClick={() => setEditing("new")} className={primaryButtonClassName}>
              + Thêm lời làm chứng
            </button>
          </>
        }
      />
      {loadError && <AdminError>{loadError}</AdminError>}

      <AdminStatCards
        items={[
          {
            label: "Lời chứng chờ duyệt",
            value: testimonies.filter((item) => item.status === "pending").length,
            tone: "gold",
          },
          {
            label: "Lời chứng công khai",
            value: testimonies.filter((item) => item.status === "approved").length,
            tone: "green",
            hint: "Trang /preachout hiện 3 lời chứng mới nhất",
          },
          {
            label: "Truyền giảng sắp tới",
            value: upcomingOutreach.length,
            tone: "blue",
            hint: `${outreachRegistered} người đã đăng ký`,
          },
          {
            label: "Tài liệu truyền giảng",
            value: resourceCounts.published,
            tone: "slate",
            hint: `${resourceCounts.total - resourceCounts.published} bản nháp`,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <AdminToolbar query={query} onQueryChange={reset(setQuery)} placeholder="Tìm theo tên, nội dung, sự kiện…">
            <AdminSelect
              label="Trạng thái"
              value={status}
              onChange={reset(setStatus)}
              options={[
                { value: "all", label: "Mọi trạng thái" },
                ...(Object.keys(TESTIMONY_STATUS_LABELS) as AdminTestimonyStatus[]).map((value) => ({
                  value,
                  label: TESTIMONY_STATUS_LABELS[value],
                })),
              ]}
            />
          </AdminToolbar>

          <AdminPanel>
            {!pageItems.length ? (
              <AdminEmpty>
                {testimonies.length
                  ? "Không có lời làm chứng nào khớp bộ lọc."
                  : "Chưa có lời làm chứng. Bấm “Thêm lời làm chứng” để ghi lại lời chứng đầu tiên."}
              </AdminEmpty>
            ) : (
              <ul>
                {pageItems.map((item) => {
                  const rowBusy = busyIds.includes(item.id);
                  return (
                    <li key={item.id} className="border-t border-white/70 px-5 py-5 first:border-t-0">
                      <div className="flex items-start gap-4">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e7edf5] text-sm font-black text-[#475467]">
                            {item.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditing(item)}
                              className="text-left font-extrabold text-[#182230] hover:text-[#0066cc]"
                            >
                              {item.name}
                            </button>
                            {item.role && <span className="text-xs font-bold text-[#667085]">{item.role}</span>}
                            <Pill className={testimonyStatusClassName[item.status]}>
                              {TESTIMONY_STATUS_LABELS[item.status]}
                            </Pill>
                          </div>
                          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#344054]">
                            “{item.quote}”
                          </p>
                          <p className="mt-2 text-xs font-bold text-[#98a2b3]">
                            {formatVnDate(item.createdAt)}
                            {item.eventTitle ? ` · ${item.eventTitle}` : ""}
                            {item.submitterEmail ? ` · ${item.submitterEmail}` : ""}
                            {item.approverName && item.status === "approved" ? ` · Duyệt bởi ${item.approverName}` : ""}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.status !== "approved" && (
                              <button
                                type="button"
                                disabled={rowBusy}
                                onClick={() => setTestimonyStatus(item, "approved")}
                                className={`${smallButtonClassName} !border-[#2d8f58] !bg-[#2d8f58] !text-white`}
                              >
                                Duyệt
                              </button>
                            )}
                            {item.status !== "rejected" && (
                              <button type="button" disabled={rowBusy} onClick={() => setTestimonyStatus(item, "rejected")} className={smallButtonClassName}>
                                {item.status === "approved" ? "Ẩn khỏi trang" : "Từ chối"}
                              </button>
                            )}
                            {item.status !== "pending" && (
                              <button type="button" disabled={rowBusy} onClick={() => setTestimonyStatus(item, "pending")} className={smallButtonClassName}>
                                Đưa về chờ duyệt
                              </button>
                            )}
                            <button type="button" onClick={() => setEditing(item)} className={smallButtonClassName}>
                              Sửa
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminPanel>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs font-bold text-[#667085] sm:flex-row">
            <span>
              {filtered.length} / {testimonies.length} lời làm chứng
            </span>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>

        <aside className="grid content-start gap-4 xl:mt-6">
          <section className="rounded-[24px] border border-white/64 bg-white/56 p-5 shadow-[0_18px_42px_rgba(31,48,70,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#0f172a]">Hoạt động sắp tới</h2>
              <Link href="/admin/events?type=outreach" className="text-xs font-extrabold text-[#0066cc]">
                Quản lý →
              </Link>
            </div>
            {!upcomingOutreach.length ? (
              <p className="mt-4 text-sm font-semibold text-[#667085]">
                Chưa có hoạt động truyền giảng sắp tới.{" "}
                <Link href="/admin/events?type=outreach" className="font-extrabold text-[#0066cc]">
                  Tạo sự kiện
                </Link>
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {upcomingOutreach.slice(0, 5).map((event) => (
                  <li key={event.id} className="rounded-[14px] bg-white/80 p-3">
                    <p className="text-sm font-extrabold text-[#182230]">{event.title}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{formatVnDateTime(event.startsAt)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Pill className={eventStatusClassName[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Pill>
                      <span className="text-xs font-extrabold text-[#344054]">
                        {event.registered}
                        {event.capacity ? `/${event.capacity}` : ""} người
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[24px] border border-white/64 bg-white/56 p-5 shadow-[0_18px_42px_rgba(31,48,70,0.08)] backdrop-blur-xl">
            <h2 className="text-base font-extrabold text-[#0f172a]">Tài liệu truyền giảng</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
              Tài liệu thuộc danh mục “Truyền giảng” trong thư viện sẽ hiện ở mục tải về của trang /preachout.
            </p>
            <Link href="/admin/library?category=truyen-giang" className={`${secondaryButtonClassName} mt-4 w-full no-underline`}>
              Quản lý tài liệu ({resourceCounts.total})
            </Link>
          </section>
        </aside>
      </div>

      {editing && (
        <AdminTestimonyForm
          key={editing === "new" ? "new" : editing.id}
          testimony={editing === "new" ? null : editing}
          events={outreachEvents.map((event) => ({ id: event.id, title: event.title, startsAt: event.startsAt }))}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={save}
          onDelete={editing === "new" ? undefined : () => remove(editing)}
        />
      )}
    </>
  );
}
