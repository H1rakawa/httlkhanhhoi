"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PrayerAvatar from "@/com/pray/PrayerAvatar";
import { PRAYER_PRIVACY_LABELS, relativeTime, type PrayerComment } from "@/com/pray/prayData";
import {
  ADMIN_PRAYER_STATUS_LABELS,
  formatAdminDate,
  type AdminPrayerItem,
  type AdminPrayerStatus,
} from "./adminPrayerData";
import { adminPrayerStatusClassName } from "./AdminPrayerTable";

type CommentState =
  | { prayerId: number; status: "ready"; items: PrayerComment[] }
  | { prayerId: number; status: "error" };

const STATUS_ACTIONS: Record<AdminPrayerStatus, Array<{ status: AdminPrayerStatus; label: string; tone: string }>> = {
  pending: [
    { status: "approved", label: "Duyệt và công khai", tone: "bg-[#2d8f58] text-white hover:bg-[#257a4b]" },
    { status: "rejected", label: "Từ chối", tone: "bg-white text-[#b42318] hover:bg-[#fff6f5]" },
  ],
  approved: [
    { status: "answered", label: "Đánh dấu đã nhậm lời", tone: "bg-[#0066cc] text-white hover:bg-[#0077ee]" },
    { status: "pending", label: "Ẩn, đưa về chờ duyệt", tone: "bg-white text-[#8a6110] hover:bg-[#fffaf0]" },
  ],
  answered: [
    { status: "approved", label: "Bỏ đánh dấu nhậm lời", tone: "bg-white text-[#0066cc] hover:bg-[#f3f8ff]" },
  ],
  rejected: [
    { status: "approved", label: "Duyệt lại", tone: "bg-[#2d8f58] text-white hover:bg-[#257a4b]" },
    { status: "pending", label: "Đưa về chờ duyệt", tone: "bg-white text-[#8a6110] hover:bg-[#fffaf0]" },
  ],
};

export default function AdminPrayerDetail({
  prayer,
  busy,
  onClose,
  onSetStatus,
  onDelete,
}: {
  prayer: AdminPrayerItem;
  busy: boolean;
  onClose: () => void;
  onSetStatus: (status: AdminPrayerStatus) => void;
  onDelete: () => void;
}) {
  const [comments, setComments] = useState<CommentState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/prayers/${prayer.id}/comments`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as PrayerComment[] | null;
        if (!response.ok || !Array.isArray(data)) throw new Error();
        if (active) setComments({ prayerId: prayer.id, status: "ready", items: data });
      })
      .catch(() => {
        if (active) setComments({ prayerId: prayer.id, status: "error" });
      });
    return () => {
      active = false;
    };
  }, [prayer.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentComments = comments?.prayerId === prayer.id ? comments : null;
  const button = "h-10 rounded-full border border-white/80 px-5 text-sm font-extrabold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50";

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex justify-end bg-[#0f172a]/30 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-prayer-title"
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[#f7f9fc] shadow-[0_0_80px_rgba(15,23,42,0.25)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e9f1] p-6">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${adminPrayerStatusClassName[prayer.status]}`}>
              {ADMIN_PRAYER_STATUS_LABELS[prayer.status]}
            </span>
            <h2 id="admin-prayer-title" className="mt-3 text-xl font-extrabold text-[#0f172a]">
              {prayer.title}
            </h2>
            <p className="mt-1 text-xs font-bold text-[#667085]">
              {prayer.category} · {PRAYER_PRIVACY_LABELS[prayer.privacy]}
              {prayer.isAnonymous ? " · Ẩn danh với cộng đồng" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#667085] hover:bg-white"
            aria-label="Đóng"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 p-6">
          <div className="flex items-center gap-3 rounded-[18px] bg-white p-4 shadow-sm">
            <PrayerAvatar name={prayer.senderName} src={prayer.senderAvatar} size={44} />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#182230]">{prayer.senderName}</p>
              {prayer.senderEmail && (
                <a href={`mailto:${prayer.senderEmail}`} className="block truncate text-xs font-bold text-[#0066cc]">
                  {prayer.senderEmail}
                </a>
              )}
            </div>
          </div>

          <p className="whitespace-pre-line text-sm font-semibold leading-7 text-[#344054]">{prayer.content}</p>

          {prayer.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={prayer.imageUrl} alt="" className="max-h-72 w-full rounded-[18px] object-cover" />
          )}

          <dl className="grid grid-cols-2 gap-3 text-xs font-bold text-[#667085]">
            <div className="rounded-[14px] bg-white p-3">
              <dt>Ngày gửi</dt>
              <dd className="mt-1 text-sm font-extrabold text-[#182230]">{formatAdminDate(prayer.createdAt)}</dd>
            </div>
            <div className="rounded-[14px] bg-white p-3">
              <dt>Lượt cầu thay</dt>
              <dd className="mt-1 text-sm font-extrabold text-[#182230]">{prayer.intercessionCount}</dd>
            </div>
            <div className="rounded-[14px] bg-white p-3">
              <dt>Duyệt</dt>
              <dd className="mt-1 text-sm font-extrabold text-[#182230]">
                {prayer.approvedAt
                  ? `${formatAdminDate(prayer.approvedAt)}${prayer.approverName ? ` · ${prayer.approverName}` : ""}`
                  : "—"}
              </dd>
            </div>
            <div className="rounded-[14px] bg-white p-3">
              <dt>Nhậm lời</dt>
              <dd className="mt-1 text-sm font-extrabold text-[#182230]">{formatAdminDate(prayer.answeredAt)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS[prayer.status].map((action) => (
              <button
                key={action.status}
                type="button"
                disabled={busy}
                onClick={() => onSetStatus(action.status)}
                className={`${button} ${action.tone}`}
              >
                {action.label}
              </button>
            ))}
            {confirmDelete ? (
              <span className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={busy} onClick={onDelete} className={`${button} bg-[#b42318] text-white hover:bg-[#9b1c13]`}>
                  Xác nhận xóa
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className={`${button} bg-white text-[#526579]`}>
                  Hủy
                </button>
              </span>
            ) : (
              <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className={`${button} bg-white text-[#b42318] hover:bg-[#fff6f5]`}>
                Xóa
              </button>
            )}
          </div>

          <section>
            <h3 className="text-sm font-extrabold text-[#182230]">
              Lời động viên ({currentComments?.status === "ready" ? currentComments.items.length : prayer.commentCount})
            </h3>
            <div className="mt-3 grid gap-3">
              {!currentComments ? (
                <p className="text-sm font-bold text-[#8a94a6]">Đang tải...</p>
              ) : currentComments.status === "error" ? (
                <p className="text-sm font-bold text-[#b42318]">Không tải được bình luận.</p>
              ) : currentComments.items.length === 0 ? (
                <p className="text-sm font-bold text-[#8a94a6]">Chưa có lời động viên nào.</p>
              ) : (
                currentComments.items.map((comment) => (
                  <article key={comment.id} className="flex gap-3 rounded-[16px] bg-white p-4 shadow-sm">
                    <PrayerAvatar name={comment.authorName} src={comment.authorAvatar} size={32} />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#182230]">
                        {comment.authorName ?? "Thành viên"}
                        <span className="ml-2 font-bold text-[#8a94a6]" suppressHydrationWarning>
                          {relativeTime(comment.createdAt)}
                        </span>
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-[#344054]">
                        {comment.message}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
