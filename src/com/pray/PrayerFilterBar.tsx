import type { PrayerFilter } from "@/com/pray/PrayerRequestList";

const filters: Array<{ value: PrayerFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "mine", label: "Của tôi" },
  { value: "praying", label: "Đang cầu nguyện" },
  { value: "answered", label: "Đã nhận lời" },
];

type PrayerFilterBarProps = {
  filter: PrayerFilter;
  query: string;
  onFilterChange: (value: PrayerFilter) => void;
  onQueryChange: (value: string) => void;
};

export default function PrayerFilterBar({
  filter,
  query,
  onFilterChange,
  onQueryChange,
}: PrayerFilterBarProps) {
  return (
    <div className="liquid-glass flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2 rounded-[14px] border border-white/80 bg-white/46 p-1.5">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => onFilterChange(item.value)}
            className={[
              "h-10 rounded-[10px] px-5 text-sm font-semibold transition-colors",
              filter === item.value
                ? "bg-[#111113] text-white shadow-sm"
                : "text-[#6e6e73] hover:bg-white/58",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="prayer-search">
        Tìm kiếm lời cầu thay
      </label>
      <input
        id="prayer-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Tìm kiếm lời cầu thay..."
        className="h-11 rounded-[12px] border border-white/80 bg-white/58 px-4 text-sm outline-none placeholder:text-[#8a929c] focus:border-[#6c4cff] md:w-80"
      />
    </div>
  );
}
