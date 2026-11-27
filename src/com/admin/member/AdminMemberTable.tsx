"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Pagination from "@/com/lib/Pagination";
import { type AdminMember } from "@/com/admin/member/memberData";
import {
  MemberActionMenu,
  MemberMinistrySelect,
  MemberRoleSelect,
  type MemberRowAction,
} from "@/com/admin/member/AdminMemberMenus";
import type { MemberRole } from "@/lib/roles";
import type { Ministry } from "@/lib/ministries";

function BlockedPill() {
  return (
    <span className="ml-2 inline-flex shrink-0 rounded-full bg-[#fee4e2] px-2 py-0.5 text-[10px] font-extrabold text-[#b42318]">
      Đã khoá
    </span>
  );
}

type TooltipState = {
  text: string;
  top: number;
  left: number;
} | null;

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
        <span
          className="h-0.5 w-2.5 rounded-full bg-current"
          aria-hidden="true"
        />
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
            className="pointer-events-none fixed z-150 max-w-75 -translate-y-full rounded-[14px] border border-white/80 bg-white/95 px-3.5 py-2 text-xs font-extrabold leading-5 text-[#303943] shadow-[0_18px_42px_rgba(31,48,70,0.2)] backdrop-blur-xl"
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

function MemberMobileCard({
  member,
  isSelf,
  isSelected,
  onToggleMember,
  onOpenDetail,
  onPickRole,
  onSaveMinistries,
  onAction,
}: {
  member: AdminMember;
  isSelf: boolean;
  isSelected: boolean;
  onToggleMember: () => void;
  onOpenDetail: () => void;
  onPickRole: (role: MemberRole) => void;
  onSaveMinistries: (ministries: Ministry[]) => Promise<boolean>;
  onAction: (action: MemberRowAction) => void;
}) {
  return (
    <article
      className={[
        "rounded-[22px] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_16px_34px_rgba(31,48,70,0.08)]",
        isSelected
          ? "border-[#0066cc]/30 bg-[#eaf4ff]/58"
          : "border-white/64 bg-white/42",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <Checkbox
            checked={isSelected}
            label={
              isSelected ? `Bỏ chọn ${member.name}` : `Chọn ${member.name}`
            }
            onClick={onToggleMember}
          />
        </div>

        <button
          type="button"
          onClick={onOpenDetail}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex min-w-0 items-center text-base font-extrabold text-[#17202a]">
            <span className="truncate">{member.name}</span>
            {member.status === "blocked" && <BlockedPill />}
          </span>
          <span className="mt-1 block truncate text-sm font-bold text-[#65717c]">
            {member.email}
          </span>
        </button>

        <MemberActionMenu
          member={member}
          isSelf={isSelf}
          onView={onOpenDetail}
          onAction={onAction}
        />
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-2 text-left text-xs font-extrabold text-[#4c5662]">
        <div className="rounded-2xl bg-white/58 px-3 py-2">
          Vai trò
          <div className="mt-1">
            <MemberRoleSelect member={member} isSelf={isSelf} onPick={onPickRole} />
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenDetail}
          className="rounded-2xl bg-white/58 px-3 py-2 text-left"
        >
          Ngày tham gia
          <span className="mt-1 block text-[#65717c]">{member.joinedAt}</span>
        </button>
        <div className="col-span-2 rounded-2xl bg-white/58 px-3 py-2">
          Ban ngành
          <div className="mt-1">
            <MemberMinistrySelect member={member} max={4} onSave={onSaveMinistries} />
          </div>
        </div>
      </div>
    </article>
  );
}

function MemberDetailModal({
  member,
  isSelf,
  onClose,
  onPickRole,
  onSaveMinistries,
}: {
  member: AdminMember;
  isSelf: boolean;
  onClose: () => void;
  onPickRole: (role: MemberRole) => void;
  onSaveMinistries: (ministries: Ministry[]) => Promise<boolean>;
}) {
  const initial = member.name.charAt(0).toUpperCase();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-110 flex overflow-y-auto bg-white/38 px-4 py-8 backdrop-blur-[10px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-detail-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="liquid-glass relative m-auto w-full max-w-160 overflow-hidden rounded-[28px] border-white/80 bg-white/74 text-[#141922] shadow-[0_34px_120px_rgba(31,48,70,0.2)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* .liquid-glass > * ép position: relative, nên nút đóng nằm trong khung ảnh bìa để định vị góc phải. */}
        <div className="h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(244,248,255,0.86)),url('/images/parallax-background.png')] bg-cover bg-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/92 text-[#303943] shadow-[0_14px_32px_rgba(31,48,70,0.18)] backdrop-blur-xl transition hover:bg-white hover:text-[#0066cc] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0066cc]"
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
        </div>

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
              <dd className="mt-3 text-base font-extrabold">
                {member.joinedAt}
              </dd>
            </div>
          </dl>

          <section className="mt-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
              Ban ngành
            </p>
            <div className="mt-3">
              <MemberMinistrySelect member={member} max={13} onSave={onSaveMinistries} />
            </div>
          </section>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe6ef]/80 pt-5">
            <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">
              Vai trò
              <MemberRoleSelect member={member} isSelf={isSelf} onPick={onPickRole} />
            </div>
            {member.status === "blocked" && (
              <span className="rounded-full bg-[#fee4e2] px-3 py-1.5 text-xs font-extrabold text-[#b42318]">
                Tài khoản đang bị khoá
              </span>
            )}
          </div>
        </div>
      </article>
    </div>,
    document.body,
  );
}

export default function AdminMemberTable({
  members,
  currentUserId,
  selectedIds,
  onToggleMember,
  onToggleAll,
  onPickRole,
  onSaveMinistries,
  onAction,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  members: AdminMember[];
  currentUserId: string;
  selectedIds: string[];
  onToggleMember: (memberId: string) => void;
  onToggleAll: () => void;
  onPickRole: (members: AdminMember[], role: MemberRole) => void;
  onSaveMinistries: (member: AdminMember, ministries: Ministry[]) => Promise<boolean>;
  onAction: (member: AdminMember, action: MemberRowAction) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const [activeMember, setActiveMember] = useState<AdminMember | null>(null);
  const isAllSelected =
    members.length > 0 && selectedIds.length === members.length;
  const hasSelection = selectedIds.length > 0;
  const showingLabel = `Hiển thị ${members.length}/${total} thành viên`;

  return (
    <section className="liquid-glass mt-6 rounded-[24px] lg:mt-7 lg:rounded-[28px]">
      <div className="grid gap-3 p-3 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-[18px] bg-white/42 px-3 py-3 text-sm font-extrabold text-[#3d4650]">
          <span>Chọn tất cả trang này</span>
          <Checkbox
            checked={isAllSelected}
            mixed={hasSelection && !isAllSelected}
            label={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            onClick={onToggleAll}
          />
        </div>

        {members.map((member) => {
          const isSelected = selectedIds.includes(member.id);

          return (
            <MemberMobileCard
              key={member.id}
              member={member}
              isSelf={member.id === currentUserId}
              isSelected={isSelected}
              onToggleMember={() => onToggleMember(member.id)}
              onOpenDetail={() => setActiveMember(member)}
              onPickRole={(role) => onPickRole([member], role)}
              onSaveMinistries={(ministries) => onSaveMinistries(member, ministries)}
              onAction={(action) => onAction(member, action)}
            />
          );
        })}
      </div>

      <div className="hidden overflow-x-visible lg:block">
        <table className="w-full min-w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-[#dbe3ea]/70 bg-white/34 text-xs font-extrabold text-[#202832]">
              <th className="w-11 px-4 py-5">
                <Checkbox
                  checked={isAllSelected}
                  mixed={hasSelection && !isAllSelected}
                  label={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  onClick={onToggleAll}
                />
              </th>
              <th className="w-[19%] px-3 py-5">Thành viên</th>
              <th className="w-[22%] px-3 py-5">Email</th>
              <th className="w-[15%] px-3 py-5">Vai trò</th>
              <th className="w-[24%] px-3 py-5">Ban ngành</th>
              <th className="w-[12%] px-3 py-5">Ngày tham gia</th>
              <th className="w-18 px-3 py-5" aria-label="Thao tác" />
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
                  <td className="w-11 px-4 py-5">
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
                    <div className="flex min-w-0 items-center">
                      <div className="min-w-0 flex-1">
                        <TruncatedInfoButton
                          text={member.name}
                          onClick={() => setActiveMember(member)}
                        />
                      </div>
                      {member.status === "blocked" && <BlockedPill />}
                    </div>
                  </td>
                  <td className="px-3 py-5 text-[#65717c]">
                    <TruncatedInfoButton
                      text={member.email}
                      onClick={() => setActiveMember(member)}
                      className="text-[#65717c]"
                    />
                  </td>
                  <td className="px-3 py-5">
                    <MemberRoleSelect
                      member={member}
                      isSelf={member.id === currentUserId}
                      onPick={(role) => onPickRole([member], role)}
                    />
                  </td>
                  <td className="px-3 py-5">
                    <MemberMinistrySelect
                      member={member}
                      onSave={(ministries) => onSaveMinistries(member, ministries)}
                    />
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
                  <td className="w-18 px-3 py-5 text-center">
                    <MemberActionMenu
                      member={member}
                      isSelf={member.id === currentUserId}
                      onView={() => setActiveMember(member)}
                      onAction={(action) => onAction(member, action)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#dbe3ea]/58 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="text-sm font-extrabold text-[#5f6f82]">
          {showingLabel}
        </p>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          className="justify-start px-0 py-0 sm:justify-end"
          onPageChange={onPageChange}
        />
      </div>
      {activeMember && (
        <MemberDetailModal
          member={members.find((member) => member.id === activeMember.id) ?? activeMember}
          isSelf={activeMember.id === currentUserId}
          onClose={() => setActiveMember(null)}
          onPickRole={(role) => onPickRole([activeMember], role)}
          onSaveMinistries={(ministries) => onSaveMinistries(activeMember, ministries)}
        />
      )}
    </section>
  );
}
