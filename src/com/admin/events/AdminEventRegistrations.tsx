"use client";

import { toast } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { AdminDrawer, Pill, secondaryButtonClassName, smallButtonClassName } from "@/com/admin/ui/AdminUi";
import { adminFetch, downloadCsv, formatVnDateTime } from "@/com/admin/ui/adminClient";
import {
  REGISTRATION_STATUS_LABELS,
  registrationStatusClassName,
  type AdminEvent,
  type AdminRegistration,
  type AdminRegistrationStatus,
} from "./adminEventData";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: AdminRegistration[] };

export default function AdminEventRegistrations({
  event,
  onClose,
  onChanged,
}: {
  event: AdminEvent;
  onClose: () => void;
  /** Báo cho bảng sự kiện số người đăng ký mới (chưa huỷ). */
  onChanged: (registered: number, registrationCount: number) => void;
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [busyIds, setBusyIds] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    adminFetch<{ registrations: AdminRegistration[] }>(`/api/admin/events/${event.id}/registrations`)
      .then(({ registrations }) => active && setState({ status: "ready", items: registrations }))
      .catch((error: unknown) =>
        active &&
        setState({ status: "error", message: error instanceof Error ? error.message : "Không tải được." }),
      );
    return () => {
      active = false;
    };
  }, [event.id]);

  const items = useMemo(() => (state.status === "ready" ? state.items : []), [state]);
  const summary = useMemo(() => {
    const active = items.filter((item) => item.status !== "cancelled");
    return {
      people: active.reduce((sum, item) => sum + item.attendees, 0),
      count: active.length,
      attended: items.filter((item) => item.status === "attended").reduce((sum, item) => sum + item.attendees, 0),
    };
  }, [items]);

  const applyItems = (next: AdminRegistration[]) => {
    setState({ status: "ready", items: next });
    const active = next.filter((item) => item.status !== "cancelled");
    onChanged(active.reduce((sum, item) => sum + item.attendees, 0), active.length);
  };

  const run = async (ids: number[], task: () => Promise<void>) => {
    setBusyIds((current) => [...current, ...ids]);
    try {
      await task();
    } catch (error) {
      toast.danger("Chưa thực hiện được", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        timeout: 4000,
      });
    } finally {
      setBusyIds((current) => current.filter((id) => !ids.includes(id)));
    }
  };

  const setStatus = (ids: number[], status: AdminRegistrationStatus) =>
    run(ids, async () => {
      const { registrations } = await adminFetch<{ registrations: AdminRegistration[] }>(
        `/api/admin/events/${event.id}/registrations`,
        { method: "PATCH", body: { ids, status } },
      );
      const updated = new Map(registrations.map((item) => [item.id, item]));
      applyItems(items.map((item) => updated.get(item.id) ?? item));
    });

  const remove = (registration: AdminRegistration) => {
    if (!window.confirm(`Xoá đăng ký của ${registration.fullName}?`)) return;
    return run([registration.id], async () => {
      const { deleted } = await adminFetch<{ deleted: number[] }>(
        `/api/admin/events/${event.id}/registrations`,
        { method: "DELETE", body: { ids: [registration.id] } },
      );
      applyItems(items.filter((item) => !deleted.includes(item.id)));
    });
  };

  const exportCsv = () =>
    downloadCsv(`dang-ky-su-kien-${event.id}.csv`, [
      ["Họ tên", "Điện thoại", "Email", "Số người", "Trạng thái", "Ghi chú", "Ngày đăng ký", "Thành viên"],
      ...items.map((item) => [
        item.fullName,
        item.phone,
        item.email,
        item.attendees,
        REGISTRATION_STATUS_LABELS[item.status],
        item.note,
        formatVnDateTime(item.createdAt),
        item.userId ? "Có" : "Khách",
      ]),
    ]);

  const registeredIds = items.filter((item) => item.status === "registered").map((item) => item.id);

  return (
    <AdminDrawer
      wide
      title="Danh sách đăng ký"
      subtitle={`${event.title} · ${formatVnDateTime(event.startsAt)}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={exportCsv} disabled={!items.length} className={secondaryButtonClassName}>
            Xuất CSV
          </button>
          <button
            type="button"
            disabled={!registeredIds.length || busyIds.length > 0}
            onClick={() => setStatus(registeredIds, "attended")}
            className={secondaryButtonClassName}
          >
            Điểm danh tất cả ({registeredIds.length})
          </button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Số người", value: `${summary.people}${event.capacity ? ` / ${event.capacity}` : ""}` },
          { label: "Lượt đăng ký", value: summary.count },
          { label: "Đã tham dự", value: summary.attended },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[14px] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-[#667085]">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-[#0f172a]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {state.status === "loading" && <p className="text-sm font-bold text-[#667085]">Đang tải…</p>}
        {state.status === "error" && <p className="text-sm font-bold text-[#b42318]">{state.message}</p>}
        {state.status === "ready" && !items.length && (
          <p className="rounded-[14px] bg-white p-6 text-center text-sm font-bold text-[#667085]">
            Chưa có ai đăng ký sự kiện này.
          </p>
        )}
        <ul className="grid gap-3">
          {items.map((item) => {
            const busy = busyIds.includes(item.id);
            return (
              <li key={item.id} className="rounded-[16px] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#182230]">
                      {item.fullName}
                      <span className="ml-2 text-xs font-bold text-[#667085]">
                        {item.attendees} người · {item.userId ? "Thành viên" : "Khách"}
                      </span>
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs font-bold text-[#0066cc]">
                      {item.phone && <a href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}>{item.phone}</a>}
                      {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
                    </p>
                    {item.note && <p className="mt-2 text-xs font-semibold text-[#475467]">Ghi chú: {item.note}</p>}
                    <p className="mt-1 text-xs font-semibold text-[#98a2b3]">{formatVnDateTime(item.createdAt)}</p>
                  </div>
                  <Pill className={registrationStatusClassName[item.status]}>
                    {REGISTRATION_STATUS_LABELS[item.status]}
                  </Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.status !== "attended" && (
                    <button type="button" disabled={busy} onClick={() => setStatus([item.id], "attended")} className={smallButtonClassName}>
                      Điểm danh
                    </button>
                  )}
                  {item.status !== "registered" && (
                    <button type="button" disabled={busy} onClick={() => setStatus([item.id], "registered")} className={smallButtonClassName}>
                      Đưa về đã đăng ký
                    </button>
                  )}
                  {item.status !== "cancelled" && (
                    <button type="button" disabled={busy} onClick={() => setStatus([item.id], "cancelled")} className={smallButtonClassName}>
                      Huỷ đăng ký
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(item)}
                    className={`${smallButtonClassName} !text-[#b42318]`}
                  >
                    Xoá
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AdminDrawer>
  );
}
