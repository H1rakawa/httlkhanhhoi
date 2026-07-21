"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { adminSidebarItems } from "@/com/admin/adminData";

type AdminSidebarProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
  activeHref?: string;
};

export default function AdminSidebar({
  adminId,
  displayName,
  avatarUrl,
  activeHref,
}: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={[
        "sticky top-3 z-20 flex h-[calc(100svh-1.5rem)] min-h-0 flex-col rounded-[22px] border border-white/70 bg-[rgba(232,241,242,0.58)] p-2.5 shadow-[0_30px_90px_rgba(31,48,70,0.16)] backdrop-blur-2xl transition-[width,padding] duration-300 sm:w-[76px] sm:p-3 md:top-5 md:h-[calc(100svh-2.5rem)] lg:top-6 lg:h-[calc(100svh-3rem)] lg:w-auto lg:overflow-hidden lg:rounded-[30px] lg:bg-[rgba(231,241,240,0.5)] lg:p-6",
        "w-[68px]",
        isExpanded ? "max-lg:z-40" : "",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-y-0 left-0 flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/0 bg-transparent p-2.5 transition-[width,background-color,box-shadow,border-color] duration-300 sm:p-3 lg:static lg:h-full lg:w-auto lg:flex-1 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
          isExpanded
            ? "max-lg:w-[220px] max-lg:border-white/70 max-lg:bg-[rgba(232,241,242,0.82)] max-lg:shadow-[0_30px_90px_rgba(31,48,70,0.2)]"
            : "max-sm:w-[68px] sm:max-lg:w-[76px]",
        ].join(" ")}
      >
        <div className="min-h-0 shrink-0">
          <div className="mb-4 flex h-11 items-center justify-center gap-2 lg:mb-7 lg:h-12 lg:justify-start">
            <Link
              href="/"
              className={[
                "flex min-w-0 items-end no-underline",
                isExpanded ? "justify-start gap-2" : "justify-center",
                "lg:items-center lg:justify-start lg:px-2",
              ].join(" ")}
              aria-label="HTTL. Khánh Hội trang chủ"
            >
              <Image
                src="/logo.png"
                alt="Hội Thánh Tin Lành Khánh Hội"
                width={224}
                height={72}
                priority
                className="hidden h-auto w-[176px] object-contain lg:block"
              />
              <Image
                src="/favicon.png"
                alt=""
                width={36}
                height={36}
                priority
                className="h-9 w-9 shrink-0 object-contain lg:hidden"
              />
              <span
                className={[
                  "hidden truncate pb-0.5 text-sm font-extrabold leading-none text-[#101418]",
                  isExpanded ? "max-[1023px]:block" : "",
                ].join(" ")}
              >
                HTTL Khánh Hội
              </span>
            </Link>
          </div>

          <nav className="grid grid-cols-1 gap-2 overflow-y-auto pr-0.5">
            {adminSidebarItems.map((item) => {
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-11 items-center rounded-[12px] text-sm font-extrabold no-underline transition-all duration-300 lg:h-12 lg:justify-start lg:gap-3 lg:px-4",
                    isExpanded ? "justify-start gap-3 px-3" : "justify-center",
                    isActive
                      ? "border border-[#0f172a]/20 bg-white/72 text-[#111827] shadow-[0_12px_26px_rgba(31,48,70,0.12)]"
                      : "text-[#2f3a44] hover:bg-white/62 hover:text-[#111827]",
                  ].join(" ")}
                  title={item.label}
                >
                  <DashboardIcon
                    name={item.icon}
                    className="h-5 w-5 stroke-[2.2]"
                  />
                  <span
                    className={[
                      "truncate",
                      isExpanded ? "max-lg:inline" : "max-lg:hidden",
                      "hidden lg:inline",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#4b6174]/12 pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mb-3 hidden h-11 w-full items-center justify-center rounded-[14px] bg-white/70 text-[#2f3a44] shadow-[0_10px_24px_rgba(31,48,70,0.12)] transition hover:bg-white max-lg:flex"
            aria-label={isExpanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
            aria-expanded={isExpanded}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={[
                "h-4 w-4 transition-transform duration-300",
                isExpanded ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          <Link
            href={`/admin/${adminId}`}
            className={[
              "flex items-center rounded-2xl p-1.5 text-[#101418] no-underline transition-all duration-300 hover:bg-white/56 sm:p-2 lg:justify-start lg:gap-3",
              isExpanded ? "justify-start gap-3" : "justify-center",
            ].join(" ")}
            title={displayName || "Admin Grace"}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-[#121715] text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,48,70,0.18)] lg:h-11 lg:w-11">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </span>
            <div
              className={[
                "min-w-0",
                isExpanded ? "max-lg:block" : "max-lg:hidden",
                "hidden lg:block",
              ].join(" ")}
            >
              <p className="truncate text-sm font-bold text-[#101418]">
                {displayName || "Admin Grace"}
              </p>
              <p className="text-xs font-medium text-[#687580]">Quản trị viên</p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
