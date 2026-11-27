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
  smallButtonClassName,
} from "@/com/admin/ui/AdminUi";
import { adminFetch, formatVnDateTime } from "@/com/admin/ui/adminClient";
import AdminEventForm, { type EventFormValues } from "./AdminEventForm";
import AdminEventRegistrations from "./AdminEventRegistrations";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUSES,
  EVENT_TYPE_LABELS,
  eventStatusClassName,
  type AdminEvent,
  type AdminEventType,
} from "./adminEventData";

const PAGE_SIZE = 10;

type TypeFilter = "all" | AdminEventType;
type StatusFilter = "all" | AdminEvent["status"];
type TimeFilter = "upcoming" | "past" | "all";

function isPast(event: AdminEvent, now: number) {
  return new Date(event.endsAt ?? event.startsAt).getTime() < now;
}

export default function AdminEventsContent({
  initialEvents,
  loadError,
  initialType,
}: {
  initialEvents: AdminEvent[];
  loadError: string | null;
  initialType: TypeFilter;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>(initialType);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [time, setTime] = useState<TimeFilter>("upcoming");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminEvent | "new" | null>(null);
  const [registrationsFor, setRegistrationsFor] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = events.filter(
      (event) =>
        (!q || `${event.title} ${event.location} ${event.description}`.toLowerCase().includes(q)) &&
        (type === "all" || event.type === type) &&
        (status === "all" || event.status === status) &&
        (time === "all" || (time === "past" ? isPast(event, now) : !isPast(event, now))),
    );
    // Sắp tới: gần nhất trước; đã qua: mới nhất trước.
    return result.sort((a, b) =>
      time === "upcoming"
        ? a.startsAt.localeCompare(b.startsAt)
        : b.startsAt.localeCompare(a.startsAt),
    );
  }, [events, query, type, status, time, now]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const upcoming = events.filter((event) => !isPast(event, now) && event.status !== "cancelled");

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setPage(1);
    setter(value);
  };

  const replaceEvent = (event: AdminEvent) =>
    setEvents((current) => {
      const exists = current.some((item) => item.id === event.id);
      return exists ? current.map((item) => (item.id === event.id ? event : item)) : [event, ...current];
    });

  const save = async (values: EventFormValues) => {
    setBusy(true);
    try {
      const isNew = editing === "new";
      const { event } = await adminFetch<{ event: AdminEvent }>(
        isNew ? "/api/admin/events" : `/api/admin/events/${(editing as AdminEvent).id}`,
        { method: isNew ? "POST" : "PATCH", body: values },
      );
      replaceEvent(event);
      setEditing(null);
      toast.success(isNew ? "Đã tạo sự kiện" : "Đã lưu sự kiện", { timeout: 3000 });
    } catch (error) {
      toast.danger("Chưa lưu được", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        timeout: 4000,
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (event: AdminEvent) => {
    setBusy(true);
    try {
      await adminFetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setEditing(null);
      toast.success("Đã xoá sự kiện", { timeout: 3000 });
    } catch (error) {
      toast.danger("Chưa xoá được", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        timeout: 4000,
      });
    } finally {
      setBusy(false);
    }
  };

  const quickUpdate = async (event: AdminEvent, patch: { registrationOpen?: boolean; status?: AdminEvent["status"] }) => {
    setBusyIds((current) => [...current, event.id]);
    try {
      const { event: updated } = await adminFetch<{ event: AdminEvent }>(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        body: { quick: true, ...patch },
      });
      replaceEvent(updated);
    } catch (error) {
      toast.danger("Chưa cập nhật được", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        timeout: 4000,
      });
    } finally {
      setBusyIds((current) => current.filter((id) => id !== event.id));
    }
  };

  const registrationEvent = events.find((event) => event.id === registrationsFor) ?? null;

  return (
    <>
      <AdminPageHeader
        crumb="Sự kiện"
        title="Quản lý Sự kiện"
        description="Đăng sự kiện sinh hoạt và truyền giảng, mở đăng ký và điểm danh người tham dự."
        action={
          <button type="button" onClick={() => setEditing("new")} className={primaryButtonClassName}>
            + Tạo sự kiện
          </button>
        }
      />
      {loadError && <AdminError>{loadError}</AdminError>}

      <AdminStatCards
        items={[
          { label: "Sự kiện sắp tới", value: upcoming.length, tone: "blue" },
          {
            label: "Đang mở đăng ký",
            value: upcoming.filter((event) => event.registrationOpen).length,
            tone: "green",
          },
          {
            label: "Người đăng ký (sắp tới)",
            value: upcoming.reduce((sum, event) => sum + event.registered, 0),
            tone: "gold",
          },
          {
            label: "Truyền giảng sắp tới",
            value: upcoming.filter((event) => event.type === "outreach").length,
            tone: "slate",
          },
        ]}
      />

      <AdminToolbar query={query} onQueryChange={reset(setQuery)} placeholder="Tìm theo tên, địa điểm…">
        <AdminSelect
          label="Thời gian"
          value={time}
          onChange={reset(setTime)}
          options={[
            { value: "upcoming", label: "Sắp diễn ra" },
            { value: "past", label: "Đã qua" },
            { value: "all", label: "Mọi thời gian" },
          ]}
        />
        <AdminSelect
          label="Loại"
          value={type}
          onChange={reset(setType)}
          options={[
            { value: "all", label: "Mọi loại" },
            { value: "regular", label: EVENT_TYPE_LABELS.regular },
            { value: "outreach", label: EVENT_TYPE_LABELS.outreach },
          ]}
        />
        <AdminSelect
          label="Trạng thái"
          value={status}
          onChange={reset(setStatus)}
          options={[
            { value: "all", label: "Mọi trạng thái" },
            ...EVENT_STATUSES.map((value) => ({ value, label: EVENT_STATUS_LABELS[value] })),
          ]}
        />
      </AdminToolbar>

      <AdminPanel>
        {!pageItems.length ? (
          <AdminEmpty>
            {events.length
              ? "Không có sự kiện nào khớp bộ lọc."
              : "Chưa có sự kiện nào. Bấm “Tạo sự kiện” để đăng sự kiện đầu tiên."}
          </AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white/60 text-xs font-black uppercase text-[#7f8796]">
                <tr>
                  <th className="px-5 py-3">Sự kiện</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Đăng ký</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((event) => {
                  const rowBusy = busyIds.includes(event.id);
                  return (
                    <tr key={event.id} className="border-t border-white/70 align-top hover:bg-white/40">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          {event.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={event.imageUrl} alt="" className="h-12 w-16 shrink-0 rounded-[10px] object-cover" />
                          ) : (
                            <span className="h-12 w-16 shrink-0 rounded-[10px] bg-[#e7edf5]" />
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setEditing(event)}
                              className="text-left font-extrabold text-[#182230] hover:text-[#0066cc]"
                            >
                              {event.title}
                              {event.featured && <span className="ml-2 text-xs text-[#c28a00]">★ Nổi bật</span>}
                            </button>
                            <p className="mt-1 text-xs font-bold text-[#667085]">{event.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-[#344054]">
                        {formatVnDateTime(event.startsAt)}
                        {event.endsAt && <span className="block text-[#98a2b3]">→ {formatVnDateTime(event.endsAt)}</span>}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-[#344054]">
                        {EVENT_TYPE_LABELS[event.type]}
                        <span className="block text-[#98a2b3]">{event.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setRegistrationsFor(event.id)}
                          className="text-left text-sm font-extrabold text-[#0066cc] hover:underline"
                        >
                          {event.registered}
                          {event.capacity ? ` / ${event.capacity}` : ""} người
                        </button>
                        <span className="block text-xs font-bold text-[#98a2b3]">
                          {event.registrationOpen ? "Đang mở đăng ký" : "Đóng đăng ký"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Pill className={eventStatusClassName[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Pill>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button type="button" onClick={() => setEditing(event)} className={smallButtonClassName}>
                            Sửa
                          </button>
                          <button type="button" onClick={() => setRegistrationsFor(event.id)} className={smallButtonClassName}>
                            Đăng ký ({event.registrationCount})
                          </button>
                          <button
                            type="button"
                            disabled={rowBusy || event.status === "ended" || event.status === "cancelled"}
                            onClick={() => quickUpdate(event, { registrationOpen: !event.registrationOpen })}
                            className={smallButtonClassName}
                          >
                            {event.registrationOpen ? "Đóng đăng ký" : "Mở đăng ký"}
                          </button>
                          <Link
                            href={event.type === "outreach" ? "/preachout" : "/calendar"}
                            target="_blank"
                            className={`${smallButtonClassName} no-underline`}
                          >
                            Xem
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs font-bold text-[#667085] sm:flex-row">
        <span>
          {filtered.length} / {events.length} sự kiện
        </span>
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {editing && (
        <AdminEventForm
          key={editing === "new" ? "new" : editing.id}
          event={editing === "new" ? null : editing}
          defaultType={type === "outreach" ? "outreach" : "regular"}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={save}
          onDelete={editing === "new" ? undefined : () => remove(editing)}
        />
      )}

      {registrationEvent && (
        <AdminEventRegistrations
          event={registrationEvent}
          onClose={() => setRegistrationsFor(null)}
          onChanged={(registered, registrationCount) =>
            replaceEvent({ ...registrationEvent, registered, registrationCount })
          }
        />
      )}
    </>
  );
}
