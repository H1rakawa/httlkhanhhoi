"use client";

import { toast } from "@heroui/react";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { MEMBER_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type MemberRole } from "@/lib/roles";
import type { Ministry } from "@/lib/ministries";
import MinistryPicker, { MinistryChips } from "./MinistryPicker";
import type { AdminMember } from "./memberData";

export type MemberRowAction = "reset-password" | "block" | "unblock" | "delete";

export const roleClassName: Record<MemberRole, string> = {
  admin: "bg-[#e8ddff] text-[#6d3fe0]",
  pastor: "bg-[#fff1d6] text-[#a15c00]",
  staff: "bg-[#dff3ff] text-[#0d7490]",
  deacon: "bg-[#e3f6ea] text-[#16794a]",
  member: "bg-[#eef0f2] text-[#626b75]",
};

/** Vị trí menu nổi neo theo nút bấm; đóng khi bấm ra ngoài hoặc Escape. */
function useAnchoredMenu(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
  width: number,
  align: "start" | "end",
  onClose: () => void,
) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const height = menuRef.current?.offsetHeight ?? 300;
      const above = rect.bottom + 8 + height > window.innerHeight && rect.top - 8 - height > 0;
      const left = align === "end" ? rect.right - width : rect.left;
      setPosition({
        top: above ? rect.top - 8 - height : rect.bottom + 8,
        left: Math.min(Math.max(12, left), window.innerWidth - width - 12),
      });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open, triggerRef, menuRef, width, align]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, triggerRef, menuRef, onClose]);

  return position;
}

const menuClassName =
  "fixed z-[100000] grid gap-0.5 rounded-[18px] border border-[#e8edf5] bg-white p-1.5 text-left shadow-[0_22px_60px_rgba(15,23,42,0.18)]";

function Icon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

/** Danh sách vai trò để chọn (dùng cho ô vai trò từng dòng và thanh chọn nhiều). */
function RoleOptions({
  current,
  lockedToAdmin,
  onPick,
}: {
  current: MemberRole | null;
  lockedToAdmin: boolean;
  onPick: (role: MemberRole) => void;
}) {
  return (
    <>
      <p className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8a94a6]">
        Đổi vai trò
      </p>
      {MEMBER_ROLES.map((role) => {
        const selected = role === current;
        const disabled = selected || (lockedToAdmin && role !== "admin");
        return (
          <button
            key={role}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onPick(role)}
            className={[
              "flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left transition",
              selected ? "bg-[#f3f7fb]" : "hover:bg-[#f3f7fb]",
              disabled && !selected ? "cursor-not-allowed opacity-45" : "",
            ].join(" ")}
          >
            <span className={`mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${roleClassName[role]}`}>
              {ROLE_LABELS[role]}
            </span>
            <span className="min-w-0 flex-1 pt-0.5 text-xs font-bold leading-5 text-[#667085]">
              {ROLE_DESCRIPTIONS[role]}
            </span>
            {selected && <Icon path="M5 12l4 4L19 6" className="mt-1 h-4 w-4 text-[#0066cc]" />}
          </button>
        );
      })}
      {lockedToAdmin && (
        <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold leading-4 text-[#8a94a6]">
          Bạn không thể tự hạ quyền tài khoản đang đăng nhập.
        </p>
      )}
    </>
  );
}

/** Ô vai trò trong bảng: bấm vào để mở danh sách vai trò. */
export function MemberRoleSelect({
  member,
  isSelf,
  onPick,
  className = "",
}: {
  member: AdminMember;
  isSelf: boolean;
  onPick: (role: MemberRole) => void;
  className?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const position = useAnchoredMenu(open, triggerRef, menuRef, 300, "start", () => setOpen(false));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Vai trò của ${member.name}: ${ROLE_LABELS[member.role]}. Bấm để đổi`}
        className={[
          "inline-flex max-w-full items-center gap-1.5 rounded-full py-2 pl-3 pr-2 text-xs font-extrabold transition hover:brightness-95",
          open ? "ring-2 ring-[#0066cc]/25" : "",
          roleClassName[member.role],
          className,
        ].join(" ")}
      >
        <span className="truncate">{ROLE_LABELS[member.role]}</span>
        <Icon path="m6 9 6 6 6-6" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} role="menu" className={menuClassName} style={{ ...position, width: 300 }}>
            <RoleOptions
              current={member.role}
              lockedToAdmin={isSelf}
              onPick={(role) => {
                setOpen(false);
                onPick(role);
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

/** Nút "Đổi vai trò" ở thanh chọn nhiều. */
export function BulkRoleButton({
  includesSelf,
  className,
  children,
  onPick,
}: {
  includesSelf: boolean;
  className: string;
  children: React.ReactNode;
  onPick: (role: MemberRole) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const position = useAnchoredMenu(open, triggerRef, menuRef, 300, "end", () => setOpen(false));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} role="menu" className={menuClassName} style={{ ...position, width: 300 }}>
            <RoleOptions
              current={null}
              lockedToAdmin={includesSelf}
              onPick={(role) => {
                setOpen(false);
                onPick(role);
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

const itemClassName =
  "flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm font-extrabold text-[#344054] no-underline transition hover:bg-[#f3f7fb] disabled:cursor-not-allowed disabled:opacity-45";

const ICONS = {
  view: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  key: "M15 7a4 4 0 1 1-3.5 6L5 19.5V22H2v-3l6.5-6.5A4 4 0 0 1 15 7Z M16 8h.01",
  lock: "M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4",
  unlock: "M6 11h12v10H6z M8 11V7a4 4 0 0 1 7.5-2",
  delete: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13",
};

/** Nút ⋮ cuối mỗi dòng. */
export function MemberActionMenu({
  member,
  isSelf,
  onView,
  onAction,
}: {
  member: AdminMember;
  isSelf: boolean;
  onView: () => void;
  onAction: (action: MemberRowAction) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const position = useAnchoredMenu(open, triggerRef, menuRef, 248, "end", close);
  const blocked = member.status === "blocked";

  const copyEmail = async () => {
    close();
    try {
      await navigator.clipboard.writeText(member.email);
      toast.success("Đã sao chép email", { description: member.email, timeout: 2500 });
    } catch {
      toast.danger("Không sao chép được email", { timeout: 3000 });
    }
  };

  const pick = (action: MemberRowAction) => {
    close();
    onAction(action);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
          open ? "bg-white text-[#111827]" : "text-[#6b7280] hover:bg-white/72 hover:text-[#111827]",
        ].join(" ")}
        aria-label={`Thao tác cho ${member.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Thao tác cho ${member.name}`}
            className={menuClassName}
            style={{ ...position, width: 248 }}
          >
            <button
              role="menuitem"
              type="button"
              className={itemClassName}
              onClick={() => {
                close();
                onView();
              }}
            >
              <Icon path={ICONS.view} />
              Xem chi tiết
            </button>
            <button role="menuitem" type="button" className={itemClassName} onClick={copyEmail}>
              <Icon path={ICONS.copy} />
              Sao chép email
            </button>
            <a role="menuitem" href={`mailto:${member.email}`} className={itemClassName} onClick={close}>
              <Icon path={ICONS.mail} />
              Gửi email
            </a>

            <hr className="my-1 border-[#eef2f6]" />
            <button
              role="menuitem"
              type="button"
              className={itemClassName}
              disabled={blocked}
              onClick={() => pick("reset-password")}
            >
              <Icon path={ICONS.key} />
              Gửi email đặt lại mật khẩu
            </button>
            <button
              role="menuitem"
              type="button"
              className={itemClassName}
              disabled={isSelf}
              onClick={() => pick(blocked ? "unblock" : "block")}
            >
              <Icon path={blocked ? ICONS.unlock : ICONS.lock} />
              {blocked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
            </button>

            <hr className="my-1 border-[#eef2f6]" />
            <button
              role="menuitem"
              type="button"
              disabled={isSelf}
              onClick={() => pick("delete")}
              className={`${itemClassName} text-[#d92d20] hover:bg-[#fff1f0]`}
            >
              <Icon path={ICONS.delete} />
              Xoá thành viên
            </button>
            {isSelf && (
              <p className="px-3 pb-1.5 text-[11px] font-bold leading-4 text-[#8a94a6]">
                Đây là tài khoản bạn đang đăng nhập.
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

/** Ô ban ngành: bấm để mở bảng chọn nhiều ban, bấm "Lưu" mới ghi. */
export function MemberMinistrySelect({
  member,
  max = 2,
  onSave,
}: {
  member: AdminMember;
  max?: number;
  onSave: (ministries: Ministry[]) => Promise<boolean>;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Ministry[]>(member.ministries);
  const [saving, setSaving] = useState(false);
  const close = () => !saving && setOpen(false);
  const position = useAnchoredMenu(open, triggerRef, menuRef, 360, "start", close);
  const changed = draft.join() !== member.ministries.join();

  const save = async () => {
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) setDraft(member.ministries);
          setOpen((value) => !value);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Ban ngành của ${member.name}. Bấm để chỉnh sửa`}
        className={[
          "flex w-full min-w-0 items-center gap-1.5 rounded-[12px] px-1.5 py-1 text-left transition hover:bg-white/60",
          open ? "bg-white/70 ring-2 ring-[#0066cc]/20" : "",
        ].join(" ")}
      >
        <span className="min-w-0 flex-1">
          <MinistryChips value={member.ministries} max={max} />
        </span>
        <Icon path="m6 9 6 6 6-6" className="h-3.5 w-3.5 text-[#98a2b3]" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={`Chọn ban ngành cho ${member.name}`}
            className={`${menuClassName} p-3`}
            style={{ ...position, width: 360 }}
          >
            <p className="px-1 pb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8a94a6]">
              Ban ngành · {member.name}
            </p>
            <MinistryPicker value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#eef2f6] pt-3">
              <span className="text-xs font-bold text-[#667085]">Đã chọn {draft.length} ban</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  className="h-9 rounded-full px-4 text-xs font-extrabold text-[#475467] hover:bg-[#f3f7fb]"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !changed}
                  className="h-9 rounded-full bg-[#0066cc] px-4 text-xs font-extrabold text-white transition hover:bg-[#0077ee] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
