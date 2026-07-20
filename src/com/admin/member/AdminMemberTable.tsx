"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  roleLabels,
  statusLabels,
  type AdminMember,
} from "@/com/admin/member/memberData";

const roleClassName: Record<AdminMember["role"], string> = {
  admin: "bg-[#e8ddff] text-[#7c4dff]",
  member: "bg-[#eef0f2] text-[#626b75]",
  teacher: "bg-[#dff3ff] text-[#0d7490]",
};

const statusClassName: Record<AdminMember["status"], string> = {
  active: "bg-[#e8f8ee] text-[#299f5a]",
  inactive: "bg-[#eef0f2] text-[#626b75]",
  blocked: "bg-[#ffe9e7] text-[#e56a63]",
};

function Checkbox({
  checked = false,
  mixed = false,
  label,
  onClick,
}: {
  checked?: boolean;
  mixed?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-5 w-5 items-center justify-center rounded border transition-colors",
        checked || mixed
          ? "border-[#0066cc] bg-[#0066cc] text-white shadow-[0_8px_18px_rgba(0,102,204,0.22)]"
          : "border-[#d7dde6] bg-white/44 hover:border-[#0066cc]/60",
      ].join(" ")}
      aria-label={label}
      aria-pressed={checked}
    >
      {checked && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="m5 10 3 3 7-7" />
        </svg>
      )}
      {mixed && !checked && (
        <span className="h-0.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
      )}
    </button>
  );
}

function ActionMenu({
  member,
  isOpen,
  onToggle,
  onChangeRole,
  onDelete,
}: {
  member: AdminMember;
  isOpen: boolean;
  onToggle: () => void;
  onChangeRole: () => void;
  onDelete: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const syncPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuWidth = 176;
      const gap = 8;
      setMenuPosition({
        top: rect.bottom + gap,
        left: Math.min(
          Math.max(12, rect.right - menuWidth),
          window.innerWidth - menuWidth - 12,
        ),
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
    <div className="relative flex justify-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280] transition-colors",
          isOpen ? "bg-white text-[#111827]" : "hover:bg-white/72 hover:text-[#111827]",
        ].join(" ")}
        aria-label={`Mở thao tác cho ${member.name}`}
        aria-expanded={isOpen}
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

      {isOpen &&
        createPortal(
        <div
          className="fixed z-[100] w-44 overflow-hidden rounded-[16px] border border-white/80 bg-white/92 p-2 text-sm font-extrabold text-[#303943] shadow-[0_18px_42px_rgba(31,48,70,0.18)] backdrop-blur-xl"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          <button
            type="button"
            onClick={onChangeRole}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#f1f5f9]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
            Đổi vai trò
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[#ef4444] hover:bg-[#fff1f0]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M10 11v6M14 11v6" />
              <path d="M6 7l1 14h10l1-14" />
              <path d="M9 7V4h6v3" />
            </svg>
            Xóa
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default function AdminMemberTable({
  members,
  selectedIds,
  onToggleMember,
  onToggleAll,
  onChangeRole,
  onDeleteMember,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  members: AdminMember[];
  selectedIds: string[];
  onToggleMember: (memberId: string) => void;
  onToggleAll: () => void;
  onChangeRole: (memberIds: string[]) => void;
  onDeleteMember: (memberIds: string[]) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const totalPages = Math.ceil(total / pageSize);
  const shouldShowPagination = totalPages > 1;
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );
  const isAllSelected = members.length > 0 && selectedIds.length === members.length;
  const hasSelection = selectedIds.length > 0;

  return (
    <section className="liquid-glass mt-7 rounded-[28px]">
      <div className="overflow-x-visible">
        <table className="w-full min-w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-[#dbe3ea]/70 bg-white/34 text-xs font-extrabold text-[#202832]">
              <th className="w-[44px] px-4 py-5">
                <Checkbox
                  checked={isAllSelected}
                  mixed={hasSelection && !isAllSelected}
                  label={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  onClick={onToggleAll}
                />
              </th>
              <th className="w-[15%] px-3 py-5">Thành viên</th>
              <th className="w-[23%] px-3 py-5">Email</th>
              <th className="w-[13%] px-3 py-5">Vai trò</th>
              <th className="w-[15%] px-3 py-5">Trạng thái</th>
              <th className="w-[15%] px-3 py-5">Ngày tham gia</th>
              <th className="w-[72px] px-3 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isSelected = selectedIds.includes(member.id);

              return (
                <tr
                  key={member.id}
                  className={[
                    "border-b border-[#dbe3ea]/58 text-sm font-bold text-[#2e3740] last:border-b-0",
                    isSelected ? "bg-[#eaf4ff]/42" : "bg-white/20",
                  ].join(" ")}
                >
                  <td className="w-[44px] px-4 py-5">
                    <Checkbox
                      checked={isSelected}
                      label={
                        isSelected
                          ? `Bỏ chọn ${member.name}`
                          : `Chọn ${member.name}`
                      }
                      onClick={() => onToggleMember(member.id)}
                    />
                  </td>
                  <td className="px-3 py-5">
                    <span
                      className="block truncate leading-5"
                      title={member.name}
                    >
                      {member.name}
                    </span>
                  </td>
                  <td className="px-3 py-5 text-[#65717c]">
                    <span className="block truncate" title={member.email}>
                      {member.email}
                    </span>
                  </td>
                  <td className="px-3 py-5">
                    <span
                      className={[
                        "inline-flex max-w-full justify-center rounded-full px-3 py-2 text-xs font-extrabold",
                        roleClassName[member.role],
                      ].join(" ")}
                    >
                      {roleLabels[member.role]}
                    </span>
                  </td>
                  <td className="px-3 py-5">
                    <span
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold",
                        statusClassName[member.status],
                      ].join(" ")}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {statusLabels[member.status]}
                    </span>
                  </td>
                  <td className="px-3 py-5 text-[#65717c]">
                    {member.joinedAt}
                  </td>
                  <td className="w-[72px] px-3 py-5">
                    <ActionMenu
                      member={member}
                      isOpen={openActionId === member.id}
                      onToggle={() =>
                        setOpenActionId((currentId) =>
                          currentId === member.id ? null : member.id,
                        )
                      }
                      onChangeRole={() => {
                        setOpenActionId(null);
                        onChangeRole([member.id]);
                      }}
                      onDelete={() => {
                        setOpenActionId(null);
                        onDeleteMember([member.id]);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {shouldShowPagination && (
        <div className="flex items-center justify-center gap-4 px-6 py-5 text-sm font-extrabold text-[#2d343c]">
          <button
            type="button"
            className="rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(page - 1, 1))}
          >
            &lt;
          </button>
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                pageNumber === page
                  ? "bg-[#0066cc] text-white shadow-[0_10px_22px_rgba(0,102,204,0.22)]"
                  : "text-[#2d343c] hover:bg-white/64",
              ].join(" ")}
            >
              {pageNumber}
            </button>
          ))}
          {totalPages > visiblePages.length && (
            <>
              <span>...</span>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={[
                  "rounded-full px-2 py-1",
                  totalPages === page ? "text-[#0066cc]" : "",
                ].join(" ")}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            className="rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          >
            &gt;
          </button>
        </div>
      )}
    </section>
  );
}
