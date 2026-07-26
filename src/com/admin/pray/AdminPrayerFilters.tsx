"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  adminPrayerCategoryOptions,
  adminPrayerStatusOptions,
  type AdminPrayerCategory,
  type AdminPrayerStatus,
} from "./adminPrayerData";
import { FilterIcon, SearchIcon } from "./AdminPrayerIcons";

type StatusValue = AdminPrayerStatus | "all";
type CategoryValue = AdminPrayerCategory | "Tất cả danh mục";
type FilterValue = "all" | "latest" | "pending" | "public";

const adminPrayerFilterOptions = [
  { value: "all", label: "Lọc" },
  { value: "latest", label: "Mới nhất" },
  { value: "pending", label: "Ưu tiên chờ duyệt" },
  { value: "public", label: "Ưu tiên công khai" },
] as const;

type AdminPrayerFiltersProps = {
  query: string;
  category: CategoryValue;
  status: StatusValue;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: CategoryValue) => void;
  onStatusChange: (value: StatusValue) => void;
};

export default function AdminPrayerFilters({
  query,
  category,
  status,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
}: AdminPrayerFiltersProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  return (
    <section className="liquid-glass mt-6 rounded-[24px] p-3">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_190px_165px_140px]">
        <label className="flex h-12 min-w-0 items-center gap-3 rounded-[14px] bg-white/64 px-4 text-[#8a98a8] shadow-inner">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm kiếm theo tên hoặc nội dung..."
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-extrabold text-[#111827] outline-none placeholder:text-[#929baa]"
          />
        </label>

        <DropdownSelect
          label="Danh mục"
          value={category}
          options={adminPrayerCategoryOptions.map((option) => ({
            value: option,
            label: option,
          }))}
          onChange={onCategoryChange}
        />

        <DropdownSelect
          label="Trạng thái"
          value={status}
          options={[...adminPrayerStatusOptions]}
          onChange={onStatusChange}
        />

        <DropdownSelect
          label="Bộ lọc"
          value={filter}
          options={[...adminPrayerFilterOptions]}
          onChange={setFilter}
          icon={<FilterIcon />}
          triggerClassName="bg-[#e4eefb] hover:bg-[#d8e7f8]"
        />
      </div>
    </section>
  );
}

function DropdownSelect<T extends string>({
  label,
  value,
  options,
  icon,
  triggerClassName = "bg-white hover:bg-[#f8fbff]",
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  icon?: ReactNode;
  triggerClassName?: string;
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? label;

  useEffect(() => {
    if (!isOpen) return;

    const syncPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuWidth = Math.max(rect.width, 190);
      setMenuPosition({
        top: rect.bottom + 8,
        left: Math.min(
          Math.max(12, rect.left),
          window.innerWidth - menuWidth - 12,
        ),
        width: menuWidth,
      });
    };

    syncPosition();
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  }, [isOpen]);

  return (
    <div className="relative z-30">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={[
          "flex h-12 w-full items-center justify-between gap-3 rounded-[14px] border border-white/70 px-4 text-sm font-extrabold text-[#3f4750] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_rgba(31,48,70,0.08)] transition",
          triggerClassName,
        ].join(" ")}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {icon}
          <span className="truncate">{selectedLabel}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={[
            "h-4 w-4 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed z-100000 overflow-hidden rounded-[20px] border border-[#e8edf5] bg-white p-1.5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
            role="listbox"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-[16px] px-3 py-2.5 text-left text-sm font-extrabold transition",
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
          </div>,
          document.body,
        )}
    </div>
  );
}
