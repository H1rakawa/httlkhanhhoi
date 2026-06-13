"use client";

import { useState } from "react";
import { notifications } from "@/com/dashboard/dashboardData";

export default function RecentNotifications() {
  const [readIds, setReadIds] = useState<string[]>([]);

  return (
    <section className="liquid-readable p-5 md:p-6">
      <h2 className="mb-5 text-lg font-semibold">Thông báo mới nhất</h2>
      <div className="overflow-hidden rounded-[14px] border border-white/80 bg-white/46">
        {notifications.map((notification) => {
          const isUnread = notification.unread && !readIds.includes(notification.id);

          return (
            <button
              key={notification.id}
              type="button"
              onClick={() =>
                setReadIds((current) =>
                  current.includes(notification.id)
                    ? current
                    : [...current, notification.id],
                )
              }
              className="flex w-full gap-4 border-b border-white/70 p-5 text-left last:border-b-0 hover:bg-white/48"
            >
              <span
                className={[
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  isUnread ? "bg-[#0066cc]" : "bg-transparent",
                ].join(" ")}
              />
              <span>
                <span className="block text-sm font-semibold">{notification.title}</span>
                <span className="mt-1 block text-sm leading-6 text-[#6e6e73]">
                  {notification.body}
                </span>
                <span className="mt-3 block text-xs font-semibold uppercase text-[#8a8a8f]">
                  {notification.time}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
