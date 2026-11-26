"use client";

import { useState } from "react";
import {
  contactStatusClassName,
  contactStatusLabel,
  type ContactMessage,
  type ContactStatus,
} from "./adminContactData";

type AdminContactListProps = {
  messages: ContactMessage[];
  isLoading: boolean;
  busyId: number | null;
  onUpdateStatus: (message: ContactMessage, status: ContactStatus) => void;
  onDelete: (message: ContactMessage) => void;
};

const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatDateTime(value: string | null) {
  return value ? dateTimeFormat.format(new Date(value)) : "";
}

function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span
      className={[
        "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-extrabold",
        contactStatusClassName[status],
      ].join(" ")}
    >
      {contactStatusLabel[status]}
    </span>
  );
}

function ActionButton({
  children,
  tone = "default",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  tone?: "default" | "primary" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center rounded-[10px] border px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary"
          ? "border-[#101828] bg-[#101828] text-white hover:bg-[#1f2a3d]"
          : tone === "danger"
            ? "border-[#f3c0c0] bg-[#fff5f5] text-[#b42318] hover:bg-[#ffe9e9]"
            : "border-[#dce4f2] bg-white text-[#344054] hover:bg-[#f8fbff]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminContactList({
  messages,
  isLoading,
  busyId,
  onUpdateStatus,
  onDelete,
}: AdminContactListProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <p className="px-6 py-14 text-center text-sm font-bold text-[#667085]">
        Đang tải lời nhắn...
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="px-6 py-14 text-center text-sm font-bold text-[#667085]">
        Không có lời nhắn nào phù hợp.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/40">
      {messages.map((message) => {
        const isOpen = openId === message.id;
        const isBusy = busyId === message.id;
        const isNew = message.status === "new";

        return (
          <li
            key={message.id}
            className={[
              "transition-colors",
              isOpen ? "bg-white/52" : "bg-white/16 hover:bg-white/36",
            ].join(" ")}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => {
                setOpenId(isOpen ? null : message.id);
                if (!isOpen && isNew) onUpdateStatus(message, "read");
              }}
              className="flex w-full items-start gap-4 px-5 py-4 text-left md:px-6"
            >
              <span
                className={[
                  "mt-2 h-2.5 w-2.5 shrink-0 rounded-full",
                  isNew ? "bg-[#d99a1e]" : "bg-transparent",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className={[
                      "truncate text-base text-[#182230]",
                      isNew ? "font-black" : "font-extrabold",
                    ].join(" ")}
                  >
                    {message.name}
                  </span>
                  <span className="truncate text-xs font-bold text-[#667085]">
                    {message.email} · {message.phone}
                  </span>
                </span>
                <span
                  className={[
                    "mt-1 block text-sm font-bold leading-6 text-[#475467]",
                    isOpen ? "whitespace-pre-wrap break-words" : "line-clamp-1",
                  ].join(" ")}
                >
                  {message.message}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <StatusBadge status={message.status} />
                <span className="text-xs font-bold text-[#7d8798]">
                  {formatDateTime(message.createdAt)}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-3 px-5 pb-5 md:px-6 md:pl-[54px]">
                {message.status === "replied" && (
                  <p className="text-xs font-bold text-[#2d8f58]">
                    Đã phản hồi {formatDateTime(message.repliedAt)}
                    {message.handlerName ? ` bởi ${message.handlerName}` : ""}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent("Phản hồi từ HTTL Khánh Hội")}`}
                    className="inline-flex h-9 items-center rounded-[10px] border border-[#dce4f2] bg-white px-3 text-xs font-extrabold text-[#0066cc] no-underline hover:bg-[#f8fbff]"
                  >
                    Gửi email
                  </a>
                  <a
                    href={`tel:${message.phone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex h-9 items-center rounded-[10px] border border-[#dce4f2] bg-white px-3 text-xs font-extrabold text-[#0066cc] no-underline hover:bg-[#f8fbff]"
                  >
                    Gọi điện
                  </a>
                  {message.status !== "replied" && (
                    <ActionButton
                      tone="primary"
                      disabled={isBusy}
                      onClick={() => onUpdateStatus(message, "replied")}
                    >
                      Đánh dấu đã phản hồi
                    </ActionButton>
                  )}
                  {message.status === "new" ? (
                    <ActionButton
                      disabled={isBusy}
                      onClick={() => onUpdateStatus(message, "read")}
                    >
                      Đánh dấu đã đọc
                    </ActionButton>
                  ) : (
                    <ActionButton
                      disabled={isBusy}
                      onClick={() => onUpdateStatus(message, "new")}
                    >
                      Đánh dấu chưa đọc
                    </ActionButton>
                  )}
                  {message.status !== "archived" ? (
                    <ActionButton
                      disabled={isBusy}
                      onClick={() => onUpdateStatus(message, "archived")}
                    >
                      Lưu trữ
                    </ActionButton>
                  ) : (
                    <ActionButton
                      disabled={isBusy}
                      onClick={() => onUpdateStatus(message, "read")}
                    >
                      Bỏ lưu trữ
                    </ActionButton>
                  )}
                  <ActionButton
                    tone="danger"
                    disabled={isBusy}
                    onClick={() => onDelete(message)}
                  >
                    Xoá
                  </ActionButton>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
