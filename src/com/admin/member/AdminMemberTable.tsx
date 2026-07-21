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

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;
const LONG_OFFLINE_THRESHOLD_MINUTES = 10;

type TooltipState = {
  text: string;
  top: number;
  left: number;
} | null;

function getPresenceLabel(member: AdminMember, now: number) {
  if (!member.lastSeenAt) {
    return {
      label: "Offline hơn 10 phút",
      className: "bg-[#eef0f2] text-[#626b75]",
      dotClassName: "bg-current",
    };
  }

  const lastSeenTime = new Date(member.lastSeenAt).getTime();
  const diffMinutes = Math.max(0, Math.floor((now - lastSeenTime) / 60_000));
  const isOnline = member.isOnline && now - lastSeenTime <= ONLINE_THRESHOLD_MS;

  if (isOnline) {
    return {
      label: "Online",
      className: "bg-[#e8f8ee] text-[#1f9d55]",
      dotClassName: "bg-[#22c55e]",
    };
  }

  if (diffMinutes > LONG_OFFLINE_THRESHOLD_MINUTES) {
    return {
      label: "Offline hơn 10 phút",
      className: "bg-[#eef0f2] text-[#626b75]",
      dotClassName: "bg-current",
    };
  }

  return {
    label: `Offline cách đây ${diffMinutes} phút`,
    className: "bg-[#fff4df] text-[#9a650f]",
    dotClassName: "bg-current",
  };
}

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

function TruncatedInfoButton({
  text,
  className = "",
  onClick,
}: {
  text: string;
  className?: string;
  onClick: () => void;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const showTooltip = () => {
    const element = textRef.current;
    if (!element || element.scrollWidth <= element.clientWidth) {
      setTooltip(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 300;
    setTooltip({
      text,
      top: rect.top - 10,
      left: Math.min(
        Math.max(12, rect.left),
        window.innerWidth - tooltipWidth - 12,
      ),
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltip(null)}
        onFocus={showTooltip}
        onBlur={() => setTooltip(null)}
        className={[
          "block w-full min-w-0 text-left leading-5 outline-none",
          className,
        ].join(" ")}
        aria-label={text}
      >
        <span ref={textRef} className="block truncate">
          {text}
        </span>
      </button>

      {tooltip &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[150] max-w-[300px] -translate-y-full rounded-[14px] border border-white/80 bg-white/95 px-3.5 py-2 text-xs font-extrabold leading-5 text-[#303943] shadow-[0_18px_42px_rgba(31,48,70,0.2)] backdrop-blur-xl"
            style={{
              top: tooltip.top,
              left: tooltip.left,
            }}
          >
            {tooltip.text}
          </div>,
          document.body,
        )}
    </>
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

function MemberDetailModal({
  member,
  onClose,
  onEdit,
}: {
  member: AdminMember;
  onClose: () => void;
  onEdit: () => void;
}) {
  const initial = member.name.charAt(0).toUpperCase();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-white/38 px-4 py-8 backdrop-blur-[10px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-detail-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="liquid-glass relative w-full max-w-[640px] overflow-hidden rounded-[28px] border-white/80 bg-white/74 text-[#141922] shadow-[0_34px_120px_rgba(31,48,70,0.2)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(244,248,255,0.86)),url('/images/parallax-background.png')] bg-cover bg-center" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-[#303943] shadow-[0_10px_24px_rgba(31,48,70,0.12)] transition hover:bg-white"
          aria-label="Đóng chi tiết thành viên"
        >
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
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="relative px-8 pb-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#101614] text-3xl font-extrabold text-white shadow-[0_18px_40px_rgba(31,48,70,0.2)]">
              {member.avatar ? (
                <span
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${member.avatar}")` }}
                />
              ) : (
                initial
              )}
            </div>
            <div className="pb-1">
              <h2
                id="member-detail-title"
                className="text-2xl font-extrabold tracking-[-0.04em]"
              >
                {member.name}
              </h2>
              <span
                className={[
                  "mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold",
                  statusClassName[member.status],
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                Thành viên {statusLabels[member.status].toLowerCase()}
              </span>
            </div>
          </div>

          <dl className="mt-9 grid gap-8 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Họ và tên
              </dt>
              <dd className="mt-3 text-base font-extrabold">{member.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Địa chỉ email
              </dt>
              <dd className="mt-3 break-all text-base font-extrabold">
                {member.email}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Số điện thoại
              </dt>
              <dd className="mt-3 text-base font-extrabold">
                {member.phone || "Chưa cập nhật"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
                Ngày tham gia
              </dt>
              <dd className="mt-3 text-base font-extrabold">{member.joinedAt}</dd>
            </div>
          </dl>

          <section className="mt-8 rounded-[22px] border-l-4 border-[#a78bfa] bg-white/42 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
              Nhóm đang tham gia
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[roleLabels[member.role], "Hội đồng lãnh đạo", "+2 khác"].map(
                (group) => (
                  <span
                    key={group}
                    className="rounded-full border border-[#dfe5ee] bg-white/72 px-3 py-1.5 text-xs font-bold text-[#2f3740]"
                  >
                    {group}
                  </span>
                ),
              )}
            </div>
          </section>

          <section className="mt-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
              Tiểu sử tâm linh
            </p>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#39434d]">
              {member.name} là một thành viên trong cộng đồng, đang đồng hành
              trong các hoạt động học tập, cầu thay và phục vụ của hội thánh.
            </p>
          </section>

          <div className="mt-9 flex items-center justify-between border-t border-[#dfe6ef]/80 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-3 text-sm font-extrabold text-[#475467] transition hover:bg-white/58"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-2 rounded-[14px] bg-[#111614] px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(17,22,20,0.22)]"
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
              Chỉnh sửa
            </button>
          </div>
        </div>
      </article>
    </div>,
    document.body,
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
  const [activeMember, setActiveMember] = useState<AdminMember | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const totalPages = Math.ceil(total / pageSize);
  const shouldShowPagination = totalPages > 1;
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );
  const isAllSelected = members.length > 0 && selectedIds.length === members.length;
  const hasSelection = selectedIds.length > 0;

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

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
              const presence = getPresenceLabel(member, now);

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
                    <TruncatedInfoButton
                      text={member.name}
                      onClick={() => setActiveMember(member)}
                    />
                  </td>
                  <td className="px-3 py-5 text-[#65717c]">
                    <TruncatedInfoButton
                      text={member.email}
                      onClick={() => setActiveMember(member)}
                      className="text-[#65717c]"
                    />
                  </td>
                  <td className="px-3 py-5">
                    <button
                      type="button"
                      onClick={() => setActiveMember(member)}
                      className={[
                        "inline-flex max-w-full justify-center rounded-full px-3 py-2 text-xs font-extrabold",
                        roleClassName[member.role],
                      ].join(" ")}
                    >
                      {roleLabels[member.role]}
                    </button>
                  </td>
                  <td className="px-3 py-5">
                    <button
                      type="button"
                      onClick={() => setActiveMember(member)}
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold",
                        presence.className,
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          presence.dotClassName,
                        ].join(" ")}
                      />
                      {presence.label}
                    </button>
                  </td>
                  <td className="px-3 py-5 text-[#65717c]">
                    <button
                      type="button"
                      onClick={() => setActiveMember(member)}
                      className="text-left"
                    >
                      {member.joinedAt}
                    </button>
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
      {activeMember && (
        <MemberDetailModal
          member={activeMember}
          onClose={() => setActiveMember(null)}
          onEdit={() => {
            setActiveMember(null);
            onChangeRole([activeMember.id]);
          }}
        />
      )}
    </section>
  );
}
