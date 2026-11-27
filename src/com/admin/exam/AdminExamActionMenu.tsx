"use client";

import { toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { adminFetch } from "@/com/admin/ui/adminClient";
import type { AdminExamItem, AdminExamStatus } from "./adminExamData";

const MENU_WIDTH = 228;

type StatusAction = { status: AdminExamStatus; label: string; done: string };

/** Các bước đổi trạng thái hợp lý từ trạng thái hiện tại. */
function statusActions(item: AdminExamItem): StatusAction[] {
  const actions: StatusAction[] = [];
  if (item.status === "draft") actions.push({ status: "ongoing", label: "Đăng bài tập", done: "Đã đăng bài tập" });
  if (item.status === "upcoming") actions.push({ status: "ongoing", label: "Mở ngay", done: "Đã mở bài tập" });
  if (item.status === "ongoing") actions.push({ status: "ended", label: "Kết thúc", done: "Đã kết thúc bài tập" });
  if (item.status === "ended") actions.push({ status: "ongoing", label: "Mở lại", done: "Đã mở lại bài tập" });
  if (item.status !== "draft" && item.participants === 0) {
    actions.push({ status: "draft", label: "Chuyển về nháp", done: "Đã chuyển về nháp" });
  }
  return actions;
}

function MenuIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  view: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  edit: "M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  publish: "M5 12l4 4L19 6",
  end: "M6 6h12v12H6z",
  reopen: "M4 12a8 8 0 0 1 14-5.3L20 9 M20 4v5h-5",
  draft: "M6 3h9l3 3v15H6z M14 3v4h4",
  delete: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13",
};

const itemClassName =
  "flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm font-extrabold text-[#344054] no-underline transition hover:bg-[#f3f7fb] disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminExamActionMenu({
  item,
  onChanged,
}: {
  item: AdminExamItem;
  onChanged: () => void;
}) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const close = () => {
    setOpen(false);
    setConfirmDelete(false);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuHeight = menuRef.current?.offsetHeight ?? 320;
      const placeAbove = rect.bottom + 8 + menuHeight > window.innerHeight && rect.top - 8 - menuHeight > 0;
      setPosition({
        top: placeAbove ? rect.top - 8 - menuHeight : rect.bottom + 8,
        left: Math.min(Math.max(12, rect.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 12),
      });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open, confirmDelete]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = async (task: () => Promise<string>) => {
    setBusy(true);
    try {
      const message = await task();
      toast.success(message, { timeout: 3000 });
      close();
      onChanged();
    } catch (error) {
      toast.danger("Chưa thực hiện được", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        timeout: 5000,
      });
    } finally {
      setBusy(false);
    }
  };

  const url = `/api/admin/exams/${encodeURIComponent(item.id)}`;
  const changeStatus = (action: StatusAction) =>
    run(async () => {
      await adminFetch(url, { method: "PATCH", body: { quick: true, status: action.status } });
      return action.done;
    });
  const duplicate = () =>
    run(async () => {
      const { exam } = await adminFetch<{ exam: { id: string } }>(url, {
        method: "POST",
        body: { action: "duplicate" },
      });
      router.push(`/admin/assignment/${exam.id}/edit`);
      return "Đã tạo bản sao ở trạng thái nháp";
    });
  const remove = () =>
    run(async () => {
      await adminFetch(url, { method: "DELETE" });
      return "Đã xoá bài tập";
    });

  const hasSubmissions = item.completed > 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/70 hover:text-[#0f172a]",
          open ? "bg-white/80 text-[#0f172a]" : "text-[#667085]",
        ].join(" ")}
        aria-label={`Thao tác cho ${item.title}`}
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
            aria-label={`Thao tác cho ${item.title}`}
            className="fixed z-[100000] grid gap-0.5 rounded-[18px] border border-[#e8edf5] bg-white p-1.5 text-left shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          >
            <Link role="menuitem" href={`/admin/assignment/${item.id}`} className={itemClassName} onClick={close}>
              <MenuIcon path={ICONS.view} />
              Xem &amp; chấm bài
            </Link>
            <Link role="menuitem" href={`/admin/assignment/${item.id}/edit`} className={itemClassName} onClick={close}>
              <MenuIcon path={ICONS.edit} />
              Chỉnh sửa
            </Link>
            <button role="menuitem" type="button" disabled={busy} onClick={duplicate} className={itemClassName}>
              <MenuIcon path={ICONS.copy} />
              Nhân bản
            </button>

            {statusActions(item).length > 0 && <hr className="my-1 border-[#eef2f6]" />}
            {statusActions(item).map((action) => (
              <button
                key={action.status}
                role="menuitem"
                type="button"
                disabled={busy}
                onClick={() => changeStatus(action)}
                className={itemClassName}
              >
                <MenuIcon
                  path={
                    action.status === "ended"
                      ? ICONS.end
                      : action.status === "draft"
                        ? ICONS.draft
                        : item.status === "ended"
                          ? ICONS.reopen
                          : ICONS.publish
                  }
                />
                {action.label}
              </button>
            ))}

            <hr className="my-1 border-[#eef2f6]" />
            <button
              role="menuitem"
              type="button"
              disabled={busy || hasSubmissions}
              onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}
              title={hasSubmissions ? "Đã có học viên nộp bài, hãy dùng “Kết thúc”" : undefined}
              className={[
                itemClassName,
                confirmDelete ? "bg-[#fff1f0] text-[#b42318] hover:bg-[#ffe4e1]" : "text-[#d92d20] hover:bg-[#fff1f0]",
              ].join(" ")}
            >
              <MenuIcon path={ICONS.delete} />
              {busy && confirmDelete ? "Đang xoá…" : confirmDelete ? "Bấm lần nữa để xoá" : "Xoá bài tập"}
            </button>
            {hasSubmissions && (
              <p className="px-3 pb-1.5 text-[11px] font-bold leading-4 text-[#8a94a6]">
                Đã có học viên nộp bài nên không xoá được.
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
