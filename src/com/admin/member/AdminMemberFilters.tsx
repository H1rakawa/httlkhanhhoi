"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  roleLabels,
  statusLabels,
  type MemberRole,
  type MemberStatus,
} from "@/com/admin/member/memberData";

type AdminMemberFiltersProps = {
  query: string;
  role: "" | MemberRole;
  status: "" | MemberStatus;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: "" | MemberRole) => void;
  onStatusChange: (value: "" | MemberStatus) => void;
};

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        "h-4 w-4 transition-transform duration-200",
        isOpen ? "rotate-180" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function FilterDropdown<T extends string>({
  value,
  options,
  ariaLabel,
  openKey,
  activeKey,
  onOpenChange,
  onChange,
}: {
  value: T;
  options: Array<FilterOption<T>>;
  ariaLabel: string;
  openKey: string;
  activeKey: string | null;
  onOpenChange: (value: string | null) => void;
  onChange: (value: T) => void;
}) {
  const isOpen = activeKey === openKey;
  const selectedOption = options.find((option) => option.value === value) ?? options[0];
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    const syncPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 8;
      const menuWidth = Math.max(rect.width, 150);
      setMenuPosition({
        top: rect.bottom + gap,
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
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(isOpen ? null : openKey)}
        className="flex h-12 min-w-[150px] items-center justify-between gap-3 rounded-[16px] bg-white px-5 text-sm font-extrabold text-[#3f4750] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(31,48,70,0.08)] outline-none transition hover:bg-white/95"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed z-[140] overflow-hidden rounded-[16px] border border-[#dfe7ef] bg-white p-1.5 shadow-[0_18px_45px_rgba(31,48,70,0.18)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    onOpenChange(null);
                  }}
                  className={[
                    "flex h-10 w-full items-center rounded-[12px] px-3 text-left text-sm font-bold transition-colors",
                    isSelected
                      ? "bg-[#e8f2ff] text-[#0066cc]"
                      : "text-[#3f4750] hover:bg-[#f4f7fb]",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

const roleOptions: Array<FilterOption<"" | MemberRole>> = [
  { value: "", label: "Tất cả vai trò" },
  { value: "admin", label: roleLabels.admin },
  { value: "teacher", label: roleLabels.teacher },
  { value: "member", label: roleLabels.member },
];

const statusOptions: Array<FilterOption<"" | MemberStatus>> = [
  { value: "", label: "Trạng thái" },
  { value: "active", label: statusLabels.active },
  { value: "inactive", label: statusLabels.inactive },
  { value: "blocked", label: statusLabels.blocked },
];

export default function AdminMemberFilters({
  query,
  role,
  status,
  onQueryChange,
  onRoleChange,
  onStatusChange,
}: AdminMemberFiltersProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <section className="liquid-glass mt-8 grid gap-3 rounded-[24px] p-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="flex h-12 items-center gap-3 rounded-[16px] bg-white/58 px-4 text-[#6b7280] shadow-inner">
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
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm kiếm theo tên, email..."
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#111827] outline-none placeholder:text-[#8994a3]"
        />
      </label>

      <FilterDropdown
        value={role}
        options={roleOptions}
        ariaLabel="Lọc theo vai trò"
        openKey="role"
        activeKey={activeDropdown}
        onOpenChange={setActiveDropdown}
        onChange={onRoleChange}
      />

      <FilterDropdown
        value={status}
        options={statusOptions}
        ariaLabel="Lọc theo trạng thái"
        openKey="status"
        activeKey={activeDropdown}
        onOpenChange={setActiveDropdown}
        onChange={onStatusChange}
      />
    </section>
  );
}
