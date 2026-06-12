import { eventCategories } from "@/com/calendar/calendarData";

function buildMonthOptions(activeMonth: string) {
  const [activeYear, activeMonthNumber] = activeMonth.split("-").map(Number);
  const center = new Date(activeYear, activeMonthNumber - 1, 1);

  return Array.from({ length: 25 }, (_, index) => {
    const date = new Date(center.getFullYear(), center.getMonth() + index - 12, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("vi-VN", {
      month: "long",
      year: "numeric",
    }).format(date);

    return {
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    };
  });
}

type FilterSearchBarProps = {
  activeCategory: string;
  query: string;
  month: string;
  viewMode: "calendar" | "list";
  onCategoryChange: (category: string) => void;
  onQueryChange: (query: string) => void;
  onMonthChange: (month: string) => void;
  onViewModeChange: (mode: "calendar" | "list") => void;
};

export default function FilterSearchBar({
  activeCategory,
  query,
  month,
  viewMode,
  onCategoryChange,
  onQueryChange,
  onMonthChange,
  onViewModeChange,
}: FilterSearchBarProps) {
  const monthOptions = buildMonthOptions(month);

  return (
    <section className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl">
      <div className="liquid-glass flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
          {eventCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={[
                "h-9 shrink-0 whitespace-nowrap rounded-full px-5 text-sm font-semibold",
                activeCategory === category
                  ? "bg-[#0066cc] text-white"
                  : "border border-white bg-white/68 text-[#424245]",
              ].join(" ")}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm kiếm sự kiện..."
            className="h-10 min-w-64 shrink-0 rounded-[10px] border border-white/90 bg-white/72 px-4 text-sm outline-none placeholder:text-[#9a9aa0] focus:border-[#0066cc]"
          />
          <select
            aria-label="Chọn tháng"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-10 w-48 shrink-0 cursor-pointer rounded-[10px] border border-white/90 bg-white/72 px-3 text-sm font-medium text-[#424245] outline-none focus:border-[#0066cc]"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="grid w-40 shrink-0 grid-cols-2 rounded-[10px] border border-white/90 bg-white/54 p-1">
            {(["calendar", "list"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={[
                  "h-8 whitespace-nowrap rounded-[8px] text-sm font-semibold",
                  viewMode === mode
                    ? "bg-white text-[#0066cc] shadow-sm"
                    : "text-[#6e6e73]",
                ].join(" ")}
              >
                {mode === "calendar" ? "Lịch" : "Danh sách"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
