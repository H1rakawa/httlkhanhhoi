"use client";

import { useMemo, useState } from "react";
import AdminPrayerFilters from "./AdminPrayerFilters";
import AdminPrayerHeader from "./AdminPrayerHeader";
import AdminPrayerStats from "./AdminPrayerStats";
import AdminPrayerTable from "./AdminPrayerTable";
import {
  adminPrayerItems,
  type AdminPrayerCategory,
  type AdminPrayerStatus,
} from "./adminPrayerData";

type StatusValue = AdminPrayerStatus | "all";
type CategoryValue = AdminPrayerCategory | "Tất cả danh mục";
const PAGE_SIZE = 4;
const PRAYER_TOTAL = 1284;

export default function AdminPrayerContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryValue>("Tất cả danh mục");
  const [status, setStatus] = useState<StatusValue>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return adminPrayerItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.senderName.toLowerCase().includes(normalizedQuery) ||
        item.senderEmail.toLowerCase().includes(normalizedQuery) ||
        item.content.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        category === "Tất cả danh mục" || item.category === category;
      const matchesStatus = status === "all" || item.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, query, status]);

  return (
    <div className="relative z-10 min-h-[calc(100svh-1.5rem)] px-5 py-6 text-[#111827] sm:px-8 md:min-h-[calc(100svh-2.5rem)] lg:min-h-[calc(100svh-3rem)] lg:px-9 lg:py-9">
      <AdminPrayerHeader />
      <AdminPrayerStats />
      <AdminPrayerFilters
        query={query}
        category={category}
        status={status}
        onQueryChange={(value) => {
          setPage(1);
          setQuery(value);
        }}
        onCategoryChange={(value) => {
          setPage(1);
          setCategory(value);
        }}
        onStatusChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
      />
      <AdminPrayerTable
        items={filteredItems}
        selectedIds={selectedIds}
        page={page}
        pageSize={PAGE_SIZE}
        total={PRAYER_TOTAL}
        onTogglePrayer={(prayerId) => {
          setSelectedIds((current) =>
            current.includes(prayerId)
              ? current.filter((id) => id !== prayerId)
              : [...current, prayerId],
          );
        }}
        onToggleAll={() => {
          setSelectedIds((current) =>
            filteredItems.length > 0 && current.length === filteredItems.length
              ? []
              : filteredItems.map((item) => item.id),
          );
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
