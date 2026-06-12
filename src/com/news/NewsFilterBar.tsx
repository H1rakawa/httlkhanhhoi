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
    <section className="bg-[#f5f5f7] px-5 pt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          {newsCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={[
                "h-9 rounded-full px-5 text-sm font-semibold transition-colors",
                activeCategory === category
                  ? "bg-[#0066cc] text-white"
                  : "border border-[#dedee3] bg-white text-[#6e6e73] hover:text-[#0066cc]",
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
          className="h-11 w-full rounded-[10px] border border-[#d6d6d8] bg-white px-4 text-sm outline-none placeholder:text-[#9a9aa0] focus:border-[#0066cc] md:w-80"
        />
      </div>
    </section>
  );
}
