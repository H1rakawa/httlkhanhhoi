"use client";

import { useCallback, useEffect, useState } from "react";
import EncouragementBox from "@/com/pray/EncouragementBox";
import PrayerAvatar from "@/com/pray/PrayerAvatar";
import PrayerStatusBadge from "@/com/pray/PrayerStatusBadge";
import PrivacyIndicator from "@/com/pray/PrivacyIndicator";
import {
  isPrayerOpen,
  prayerAuthorLabel,
  relativeTime,
  type PrayerComment,
  type PrayerRequest,
} from "@/com/pray/prayData";

type PrayerRequestDetailProps = {
  request: PrayerRequest | null;
  onClose: () => void;
  onToggleIntercession: (request: PrayerRequest) => void;
  onCommentCount: (id: string, count: number) => void;
  /** Lời cầu thay bị xoá hoặc đổi trạng thái: đóng và tải lại danh sách. */
  onChanged: () => void;
  onRefresh: () => void;
};

export default function PrayerRequestDetail({
  request,
  onClose,
  onToggleIntercession,
  onCommentCount,
  onChanged,
  onRefresh,
}: PrayerRequestDetailProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [comments, setComments] = useState<PrayerComment[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const requestId = request?.id;

  const startClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    if (!requestId) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") startClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [requestId, startClose]);

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    fetch(`/api/prayers/${requestId}/comments`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Không thể tải lời động viên.");
        return data as PrayerComment[];
      })
      .then((data) => {
        if (active) setComments(data);
      })
      .catch((loadError: Error) => {
        if (!active) return;
        setComments([]);
        setError(loadError.message);
      });
    return () => {
      active = false;
    };
  }, [requestId]);

  if (!request) return null;

  const open = isPrayerOpen(request);
  const author = prayerAuthorLabel(request);

  const sendComment = async (message: string) => {
    setError("");
    const response = await fetch(`/api/prayers/${request.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (!response?.ok) {
      setError(data?.error || "Không thể gửi lời động viên.");
      return false;
    }
    setComments(data as PrayerComment[]);
    onCommentCount(request.id, (data as PrayerComment[]).length);
    return true;
  };

  const markAnswered = async () => {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/prayers/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "answered" }),
    }).catch(() => null);
    setBusy(false);
    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      setError(data?.error || "Không thể cập nhật lời cầu thay.");
      return;
    }
    setNotice("Tạ ơn Chúa! Lời cầu thay đã được đánh dấu là đã nhận lời.");
    onRefresh();
  };

  const remove = async () => {
    if (!window.confirm("Xoá lời cầu thay này? Lời động viên đi kèm cũng sẽ bị xoá.")) return;
    setBusy(true);
    setError("");
    const response = await fetch(`/api/prayers/${request.id}`, { method: "DELETE" }).catch(
      () => null,
    );
    setBusy(false);
    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      setError(data?.error || "Không thể xoá lời cầu thay.");
      return;
    }
    onChanged();
  };

  const share = async () => {
    const url = `${window.location.origin}/pray?prayer=${request.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: request.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Đã sao chép liên kết. Chỉ thành viên đã đăng nhập mới mở được.");
      }
    } catch {
      // Người dùng huỷ chia sẻ.
    }
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[70] bg-[#07111f]/22 backdrop-blur-[6px]",
        isClosing
          ? "animate-[fadeOutBackdrop_260ms_ease-in_forwards]"
          : "animate-[fadeInBackdrop_220ms_ease-out]",
      ].join(" ")}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Đóng chi tiết cầu thay"
        onClick={startClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={request.title}
        className={[
          "absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-28px_0_80px_rgba(31,48,70,0.2)] md:w-[min(560px,42vw)]",
          isClosing
            ? "animate-[slideOutRight_260ms_cubic-bezier(.4,0,.2,1)_forwards]"
            : "animate-[slideInRight_320ms_cubic-bezier(.22,.8,.3,1)]",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-[#ececf0] px-8 py-6">
          <h2 className="text-xl font-semibold">Chi tiết cầu thay</h2>
          <button
            type="button"
            onClick={startClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-3xl font-light transition-colors hover:bg-[#f5f5f7]"
            aria-label="Đóng chi tiết cầu thay"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex items-center gap-4">
            <PrayerAvatar
              name={request.authorName}
              src={request.authorAvatar}
              size={64}
              anonymous={request.isAnonymous}
            />
            <div>
              <p className="font-semibold">{author}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#7b8490]">
                <span suppressHydrationWarning>{relativeTime(request.createdAt)}</span>
                <span>•</span>
                <span>{request.category}</span>
                <PrivacyIndicator privacy={request.privacy} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <h3 className="text-3xl font-semibold leading-tight">{request.title}</h3>
            <PrayerStatusBadge status={request.status} />
          </div>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#2f3338]">
            {request.content}
          </p>

          {request.status === "pending" && (
            <p className="mt-5 rounded-[14px] bg-[#fff4df] px-4 py-3 text-sm leading-6 text-[#9a5f00]">
              Lời cầu thay đang chờ ban mục vụ duyệt. Sau khi duyệt, mọi người mới cầu thay và gửi
              lời động viên được.
            </p>
          )}
          {request.status === "rejected" && (
            <p className="mt-5 rounded-[14px] bg-[#fff1f0] px-4 py-3 text-sm leading-6 text-[#b42318]">
              Ban mục vụ chưa duyệt lời cầu thay này. Bạn có thể liên hệ ban mục vụ để biết thêm.
            </p>
          )}

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              disabled={!open}
              aria-pressed={request.hasInterceded}
              onClick={() => onToggleIntercession(request)}
              className={[
                "inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-[14px] text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                request.hasInterceded
                  ? "border border-[#6c4cff] bg-[#f0ecff] text-[#6c4cff]"
                  : "bg-[#6c4cff] text-white shadow-[0_16px_30px_rgba(108,76,255,0.3)]",
              ].join(" ")}
            >
              {request.hasInterceded
                ? `♥ Bạn đã cầu nguyện · ${request.intercessionCount}`
                : `♡ Tôi đã cầu nguyện · ${request.intercessionCount}`}
            </button>
            <button
              type="button"
              onClick={share}
              className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#f1f1f3] text-xl"
              aria-label="Chia sẻ lời cầu thay"
            >
              ⤴
            </button>
          </div>

          {request.isMine && (
            <div className="mt-4 flex flex-wrap gap-2">
              {request.status === "approved" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={markAnswered}
                  className="h-10 rounded-full border border-[#34c759]/30 bg-[#e9f9ef] px-4 text-sm font-semibold text-[#1b8f45] disabled:opacity-60"
                >
                  Đánh dấu đã nhận lời
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="h-10 rounded-full border border-[#ff3b30]/20 bg-[#fff1f0] px-4 text-sm font-semibold text-[#b42318] disabled:opacity-60"
              >
                Xoá lời cầu thay
              </button>
            </div>
          )}

          {(notice || error) && (
            <p
              role="status"
              className={[
                "mt-4 rounded-[14px] px-4 py-3 text-sm font-semibold",
                error ? "bg-[#fff1f0] text-[#b42318]" : "bg-[#ecfdf3] text-[#15803d]",
              ].join(" ")}
            >
              {error || notice}
            </p>
          )}

          <div className="mt-8 border-t border-[#ececf0] pt-7">
            <h4 className="font-semibold">
              Lời động viên ({comments ? comments.length : request.commentCount})
            </h4>
            <div className="mt-5 grid gap-4">
              {comments === null ? (
                <p className="text-sm text-[#7b8490]">Đang tải lời động viên...</p>
              ) : comments.length ? (
                comments.map((comment) => (
                  <article key={comment.id} className="flex gap-3">
                    <PrayerAvatar name={comment.authorName} src={comment.authorAvatar} size={44} />
                    <div className="flex-1 rounded-[18px] bg-[#f1f1f3] px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">
                          {comment.authorName || "Thành viên"}
                          {comment.isMine && (
                            <span className="ml-2 text-xs font-medium text-[#7b8490]">(bạn)</span>
                          )}
                        </p>
                        <p className="text-sm text-[#7b8490]" suppressHydrationWarning>
                          {relativeTime(comment.createdAt)}
                        </p>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#424a55]">
                        {comment.message}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-[18px] bg-[#f5f5f7] p-5 text-sm text-[#626a75]">
                  Chưa có lời động viên. Hãy là người đầu tiên đồng hành trong lời cầu nguyện.
                </p>
              )}
            </div>
          </div>
        </div>

        <EncouragementBox
          disabled={!open && !request.isMine}
          disabledReason="Lời cầu thay đang chờ duyệt"
          onSubmit={sendComment}
        />
      </aside>
    </div>
  );
}
