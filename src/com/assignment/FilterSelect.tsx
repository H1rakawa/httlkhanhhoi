"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Dropdown lọc dạng viên thuốc: menu trắng mở ngay dưới nút (portal để không bị
 * khung cuộn ngang cắt mất), mũi tên xoay khi mở, điều khiển được bằng bàn phím.
 */
export default function FilterSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, minWidth: 0 });

  const openMenu = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    triggerRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(rect.width, menuRef.current?.offsetWidth ?? 0);
      setPosition({
        top: rect.bottom + 8,
        left: Math.min(Math.max(12, rect.left), window.innerWidth - width - 12),
        minWidth: rect.width,
      });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) menuRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(options[active]);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={[
          "group flex h-12 shrink-0 items-center gap-3 rounded-full border pl-5 pr-3 text-sm font-semibold outline-none transition",
          open
            ? "border-[#0066cc]/40 bg-white text-[#0066cc] shadow-[0_10px_26px_rgba(0,102,204,0.12)]"
            : "border-white/90 bg-white/72 text-[#1d1d1f] hover:bg-white hover:text-[#0066cc] focus-visible:border-[#0066cc]",
        ].join(" ")}
      >
        <span className="whitespace-nowrap">{value}</span>
        <span
          className={[
            "flex h-7 w-7 items-center justify-center rounded-full transition",
            open ? "bg-[#e8f2ff]" : "bg-[#f2f4f7] text-[#6e6e73] group-hover:bg-[#e8f2ff] group-hover:text-[#0066cc]",
          ].join(" ")}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="fixed z-[1000] max-h-[min(360px,calc(100vh-120px))] overflow-y-auto rounded-[20px] border border-[#e8edf5] bg-white p-1.5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
            style={position}
          >
            {options.map((option, index) => {
              const selected = option === value;
              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={[
                    "flex cursor-pointer items-center justify-between gap-4 whitespace-nowrap rounded-[14px] px-4 py-2.5 text-sm transition-colors",
                    selected ? "font-semibold text-[#0066cc]" : "font-medium text-[#1d1d1f]",
                    index === active ? "bg-[#f0f6ff]" : "",
                  ].join(" ")}
                >
                  {option}
                  {selected && (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                      <path d="m5 10 3 3 7-7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
