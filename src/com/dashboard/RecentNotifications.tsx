"use client";

import Link from "next/link";
import { useState } from "react";
import { relativeTime } from "@/com/pray/prayData";
import type { MemberNotification } from "@/lib/dashboard/notifications";

export default function RecentNotifications({
  notifications,
  failed,
}: {
  notifications: MemberNotification[];
  failed: boolean;
}) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const isUnread = (item: MemberNotification) => !item.isRead && !readIds.includes(item.id);
  const unreadIds = notifications.filter(isUnread).map((item) => item.id);

  const markRead = (ids: string[]) => {
    if (!ids.length) return;
    setReadIds((current) => [...new Set([...current, ...ids])]);
    void fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => undefined);
  };

  return (
    <section className="liquid-readable p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Thông báo mới nhất</h2>
        {unreadIds.length > 0 && (
          <button
            type="button"
            onClick={() => markRead(unreadIds)}
            className="text-sm font-medium text-[#0066cc] hover:underline"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-[14px] border border-white/80 bg-white/46 p-5 text-sm leading-6 text-[#6e6e73]">
          {failed ? "Chưa tải được thông báo." : "Bạn chưa có thông báo nào."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-white/80 bg-white/46">
          {notifications.map((notification) => {
            const unread = isUnread(notification);
            const body = (
              <>
                <span
                  className={[
                    "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                    unread ? "bg-[#0066cc]" : "bg-transparent",
                  ].join(" ")}
                />
                <span className="min-w-0">
                  {notification.title && (
                    <span className="block text-sm font-semibold">{notification.title}</span>
                  )}
                  <span className="mt-1 block text-sm leading-6 text-[#6e6e73]">
                    {notification.content}
                  </span>
                  <span
                    className="mt-3 block text-xs font-semibold uppercase text-[#8a8a8f]"
                    suppressHydrationWarning
                  >
                    {relativeTime(notification.createdAt)}
                  </span>
                </span>
              </>
            );
            const className =
              "flex w-full gap-4 border-b border-white/70 p-5 text-left text-[#1d1d1f] no-underline last:border-b-0 hover:bg-white/48";

            return notification.link ? (
              <Link
                key={notification.id}
                href={notification.link}
                onClick={() => markRead([notification.id])}
                className={className}
              >
                {body}
              </Link>
            ) : (
              <button
                key={notification.id}
                type="button"
                onClick={() => markRead([notification.id])}
                className={className}
              >
                {body}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
