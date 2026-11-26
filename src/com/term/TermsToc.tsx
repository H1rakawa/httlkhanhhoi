"use client";

import { useEffect, useRef, useState } from "react";

export type TocItem = { id: string; title: string };

/** "Vạch đọc": mục có tiêu đề đã vượt qua vạch này được coi là đang đọc. */
function readingLine() {
  return Math.max(160, window.innerHeight * 0.35);
}

export default function TermsToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  // Khi bấm vào mục lục, giữ mục đã chọn cho tới khi cuộn mượt xong.
  const lockedId = useRef<string | null>(null);
  const unlockTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      if (lockedId.current) return;
      const line = readingLine();
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = items[0]?.id ?? "";

      if (atBottom) {
        current = items[items.length - 1]?.id ?? current;
      } else {
        for (const item of items) {
          const element = document.getElementById(item.id);
          if (element && element.getBoundingClientRect().top <= line) {
            current = item.id;
          }
        }
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (lockedId.current) {
        // Cuộn mượt còn đang chạy: gia hạn khoá, mở khi cuộn dừng hẳn.
        window.clearTimeout(unlockTimer.current);
        unlockTimer.current = window.setTimeout(() => {
          lockedId.current = null;
        }, 150);
        return;
      }
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(unlockTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    event.preventDefault();
    lockedId.current = id;
    window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => {
      lockedId.current = null;
    }, 1000);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <nav aria-label="Mục lục" className="liquid-glass p-5">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8490]">
        Mục lục
      </p>
      <ol className="mt-3 space-y-1">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => goTo(event, item.id)}
                aria-current={active ? "location" : undefined}
                className={`relative block rounded-[12px] px-3 py-2 text-sm leading-5 no-underline transition-colors ${
                  active
                    ? "bg-white/80 font-semibold text-[#0066cc] shadow-[0_6px_18px_rgba(0,102,204,0.12)]"
                    : "text-[#515154] hover:bg-white/50 hover:text-[#1d1d1f]"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#0066cc] transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
