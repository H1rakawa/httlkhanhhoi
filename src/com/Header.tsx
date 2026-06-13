"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import HeaderAccountMenu from "@/com/auth/HeaderAccountMenu";
import { navItems } from "@/com/shared/data";

type HeaderProps = {
  activePath?: string;
  showNotice?: boolean;
};

export default function Header({
  activePath = "/",
  showNotice = false,
}: HeaderProps) {
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!showNotice) return;

    lastScrollY.current = window.scrollY;

    const syncNoticeVisibility = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollY.current;

      if (Math.abs(currentScrollY - previousScrollY) > 6) {
        setIsNoticeVisible(
          currentScrollY < previousScrollY || currentScrollY < 12,
        );
        lastScrollY.current = currentScrollY;
      }
    };

    const intervalId = window.setInterval(syncNoticeVisibility, 120);

    window.addEventListener("scroll", syncNoticeVisibility, { passive: true });
    window.addEventListener("wheel", syncNoticeVisibility, { passive: true });
    window.addEventListener("touchmove", syncNoticeVisibility, {
      passive: true,
    });

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("scroll", syncNoticeVisibility);
      window.removeEventListener("wheel", syncNoticeVisibility);
      window.removeEventListener("touchmove", syncNoticeVisibility);
    };
  }, [showNotice]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/92 text-white backdrop-blur-xl">
      {showNotice && (
        <div
          className={[
            "overflow-hidden border-b border-white/10 bg-[#111113] transition-[max-height,opacity,transform] duration-300 ease-out",
            isNoticeVisible
              ? "max-h-10 opacity-100 translate-y-0"
              : "max-h-0 -translate-y-2 opacity-0",
          ].join(" ")}
        >
          <div className="mx-auto flex min-h-9 max-w-7xl flex-col items-center justify-center gap-1 px-5 py-2 text-center text-xs text-white/76 md:flex-row">
            <span>
              Thông báo mới nhất: Lễ Kỷ Niệm 10 Năm HTTL. Khánh Hội vào Chủ Nhật
              tới.
            </span>
            <NextLink
              href="/calendar"
              className="text-[#2997ff] no-underline hover:text-[#6bb6ff]"
            >
              Xem chi tiết
            </NextLink>
          </div>
        </div>
      )}

      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <NextLink
          href="/"
          className="flex items-center no-underline"
          aria-label="HTTL. Khánh Hội trang chủ"
        >
          <Image
            src="/logo.png"
            alt="Hội Thánh Tin Lành Khánh Hội"
            width={355}
            height={101}
            priority
            className="h-9 w-auto brightness-0 invert"
          />
        </NextLink>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive =
              activePath !== "/" && item.href.split("#")[0] === activePath;

            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={[
                  "border-b pb-1 text-sm font-medium no-underline transition-colors",
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-white/72 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </NextLink>
            );
          })}
        </div>

        <HeaderAccountMenu />
      </nav>
    </header>
  );
}
