import { eventCategories } from "@/com/calendar/calendarData";

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
  return (
    <section className="border-y border-[#e5e5e8] bg-white px-5 py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          {eventCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={[
                "h-9 rounded-full px-5 text-sm font-semibold transition-colors",
                activeCategory === category
                  ? "bg-[#0066cc] text-white"
                  : "bg-[#f5f5f7] text-[#424245] hover:bg-[#e8f2ff] hover:text-[#0066cc]",
              ].join(" ")}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_170px_150px]">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm kiếm sự kiện..."
            className="h-10 min-w-64 rounded-[10px] border border-[#d6d6d8] bg-white px-4 text-sm outline-none transition-colors placeholder:text-[#9a9aa0] focus:border-[#0066cc]"
          />
          <input
            type="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-10 rounded-[10px] border border-[#d6d6d8] bg-white px-3 text-sm outline-none focus:border-[#0066cc]"
          />
          <div className="grid grid-cols-2 rounded-[10px] bg-[#f5f5f7] p-1">
            {(["calendar", "list"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={[
                  "h-8 rounded-[8px] text-sm font-semibold transition-colors",
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
