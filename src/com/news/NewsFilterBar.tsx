import { newsCategories } from "@/com/news/newsData";

type NewsFilterBarProps = {
  activeCategory: string;
  query: string;
  onCategoryChange: (category: string) => void;
  onQueryChange: (query: string) => void;
};

export default function NewsFilterBar({
  activeCategory,
  query,
  onCategoryChange,
  onQueryChange,
}: NewsFilterBarProps) {
  return (
    <section className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl">
      <div className="liquid-glass flex flex-col gap-5 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
          {newsCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={[
                "h-9 shrink-0 whitespace-nowrap rounded-full px-5 text-sm font-semibold",
                activeCategory === category
                  ? "bg-[#0066cc] text-white"
                  : "border border-white bg-white/68 text-[#6e6e73]",
              ].join(" ")}
            >
              {category}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm kiếm tin tức..."
          className="h-11 w-full shrink-0 rounded-[10px] border border-white/90 bg-white/76 px-4 text-sm outline-none placeholder:text-[#9a9aa0] focus:border-[#0066cc] md:w-80"
        />
      </div>
    </section>
  );
}
