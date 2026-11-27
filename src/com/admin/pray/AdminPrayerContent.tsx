"use client";

import { toast } from "@heroui/react";
import { useMemo, useState } from "react";
import AdminPrayerDetail from "./AdminPrayerDetail";
import AdminPrayerFilters from "./AdminPrayerFilters";
import AdminPrayerHeader from "./AdminPrayerHeader";
import AdminPrayerStats from "./AdminPrayerStats";
import AdminPrayerTable from "./AdminPrayerTable";
import {
  ADMIN_PRAYER_STATUS_LABELS,
  type AdminPrayerCategoryValue,
  type AdminPrayerItem,
  type AdminPrayerSort,
  type AdminPrayerStatus,
  type AdminPrayerStatusValue,
} from "./adminPrayerData";

const PAGE_SIZE = 8;
const STATUS_ORDER: Record<AdminPrayerStatus, number> = {
  pending: 0,
  approved: 1,
  answered: 2,
  rejected: 3,
};

async function callApi(method: "PATCH" | "DELETE", body: object) {
  const response = await fetch("/api/admin/prayers", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    prayers?: AdminPrayerItem[];
    deleted?: number[];
  };
  if (!response.ok) throw new Error(data.error || "Thao tác không thành công.");
  return data;
}

export default function AdminPrayerContent({
  initialItems,
  loadError,
}: {
  initialItems: AdminPrayerItem[];
  loadError: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AdminPrayerCategoryValue>("all");
  const [status, setStatus] = useState<AdminPrayerStatusValue>("all");
  const [sort, setSort] = useState<AdminPrayerSort>("pending");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = items.filter((item) => {
      const matchesQuery =
        !q ||
        [item.title, item.content, item.senderName, item.senderEmail ?? ""].some((value) =>
          value.toLowerCase().includes(q),
        );
      return (
        matchesQuery &&
        (category === "all" || item.category === category) &&
        (status === "all" || item.status === status)
      );
    });

    return result.sort((a, b) => {
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "intercessions") return b.intercessionCount - a.intercessionCount;
      if (sort === "pending" && a.status !== b.status) {
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [items, query, category, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleIds = new Set(filteredItems.map((item) => item.id));
  const selected = selectedIds.filter((id) => visibleIds.has(id));
  const openPrayer = items.find((item) => item.id === openId) ?? null;

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setPage(1);
    setter(value);
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

  const setPrayerStatus = (ids: number[], nextStatus: AdminPrayerStatus) =>
    run(ids, async () => {
      const { prayers = [] } = await callApi("PATCH", { ids, status: nextStatus });
      const updated = new Map(prayers.map((prayer) => [prayer.id, prayer]));
      setItems((current) => current.map((item) => updated.get(item.id) ?? item));
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      toast.success(
        `${prayers.length} lời cầu thay → ${ADMIN_PRAYER_STATUS_LABELS[nextStatus]}`,
        { timeout: 3000 },
      );
    });

  const deletePrayers = (ids: number[]) => {
    if (ids.length > 1 && !window.confirm(`Xóa vĩnh viễn ${ids.length} lời cầu thay đã chọn?`)) {
      return;
    }
    return run(ids, async () => {
      const { deleted = [] } = await callApi("DELETE", { ids });
      setItems((current) => current.filter((item) => !deleted.includes(item.id)));
      setSelectedIds((current) => current.filter((id) => !deleted.includes(id)));
      if (openId && deleted.includes(openId)) setOpenId(null);
      toast.success(`Đã xóa ${deleted.length} lời cầu thay`, { timeout: 3000 });
    });
  };

  return (
    <div className="relative z-10 min-h-[calc(100svh-1.5rem)] px-5 py-6 text-[#111827] sm:px-8 md:min-h-[calc(100svh-2.5rem)] lg:min-h-[calc(100svh-3rem)] lg:px-9 lg:py-9">
      <AdminPrayerHeader />
      {loadError && (
        <p className="mt-6 rounded-[16px] border border-[#ff3b30]/20 bg-[#fff1f0] px-5 py-4 text-sm font-bold text-[#b42318]">
          {loadError}
        </p>
      )}
      <AdminPrayerStats items={items} />
      <AdminPrayerFilters
        query={query}
        category={category}
        status={status}
        sort={sort}
        onQueryChange={resetPage(setQuery)}
        onCategoryChange={resetPage(setCategory)}
        onStatusChange={resetPage(setStatus)}
        onSortChange={resetPage(setSort)}
      />
      <AdminPrayerTable
        items={filteredItems}
        total={items.length}
        selectedIds={selected}
        busyIds={busyIds}
        page={currentPage}
        pageSize={PAGE_SIZE}
        onTogglePrayer={(id) =>
          setSelectedIds((current) =>
            current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
          )
        }
        onToggleAll={() =>
          setSelectedIds(
            selected.length === filteredItems.length ? [] : filteredItems.map((item) => item.id),
          )
        }
        onPageChange={setPage}
        onOpen={(prayer) => setOpenId(prayer.id)}
        onSetStatus={setPrayerStatus}
        onDelete={deletePrayers}
        onClearSelection={() => setSelectedIds([])}
      />

      {openPrayer && (
        <AdminPrayerDetail
          prayer={openPrayer}
          busy={busyIds.includes(openPrayer.id)}
          onClose={() => setOpenId(null)}
          onSetStatus={(nextStatus) => setPrayerStatus([openPrayer.id], nextStatus)}
          onDelete={() => deletePrayers([openPrayer.id])}
        />
      )}
    </div>
  );
}
