"use client";

import { MINISTRIES, MINISTRY_LABELS, normalizeMinistries, type Ministry } from "@/lib/ministries";

/** Chọn nhiều ban ngành bằng các chip bật/tắt. */
export default function MinistryPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: Ministry[];
  onChange: (next: Ministry[]) => void;
  labelledBy?: string;
}) {
  const toggle = (ministry: Ministry) =>
    onChange(
      normalizeMinistries(
        value.includes(ministry) ? value.filter((item) => item !== ministry) : [...value, ministry],
      ),
    );

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {MINISTRIES.map((ministry) => {
        const checked = value.includes(ministry);
        return (
          <button
            key={ministry}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => toggle(ministry)}
            className={[
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-extrabold transition",
              checked
                ? "border-[#0066cc] bg-[#e8f2ff] text-[#0066cc]"
                : "border-[#d7dee8] bg-white text-[#475467] hover:border-[#0066cc]/50 hover:text-[#0f172a]",
            ].join(" ")}
          >
            {checked && (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="m5 10 3 3 7-7" />
              </svg>
            )}
            {MINISTRY_LABELS[ministry]}
          </button>
        );
      })}
    </div>
  );
}

/** Hiển thị gọn danh sách ban (tối đa `max`, phần còn lại thành "+N"). */
export function MinistryChips({ value, max = 2 }: { value: Ministry[]; max?: number }) {
  if (!value.length) return <span className="text-xs font-bold text-[#98a2b3]">Chưa có ban</span>;
  const shown = value.slice(0, max);
  const rest = value.length - shown.length;
  return (
    <span className="flex min-w-0 flex-wrap gap-1.5">
      {shown.map((ministry) => (
        <span
          key={ministry}
          className="truncate rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-extrabold text-[#344054] ring-1 ring-[#e4e9f1]"
        >
          {MINISTRY_LABELS[ministry].replace(/^Ban /, "")}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-full bg-[#eef2f6] px-2 py-1 text-[11px] font-extrabold text-[#667085]">+{rest}</span>
      )}
    </span>
  );
}
