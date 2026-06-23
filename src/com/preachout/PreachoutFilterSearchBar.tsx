const filters = ["Tất cả sự kiện", "Tình nguyện", "Quyên góp", "Đào tạo"];

export default function PreachoutFilterSearchBar() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2 rounded-[14px] border border-white/80 bg-white/46 p-1.5">
        {filters.map((item, index) => (
          <button
            key={item}
            className={[
              "h-10 rounded-[10px] px-5 text-sm font-semibold transition-colors",
              index === 0
                ? "bg-white text-[#111113] shadow-sm"
                : "text-[#6e6e73] hover:bg-white/58",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor="preachout-search">
          Tìm kiếm hoạt động truyền giảng
        </label>
        <input
          id="preachout-search"
          type="search"
          placeholder="Tìm kiếm hoạt động..."
          className="h-11 min-w-0 rounded-[12px] border border-white/80 bg-white/58 px-4 text-sm outline-none placeholder:text-[#8a929c] focus:border-[#0066cc] md:w-72"
        />
        <button className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-white/80 bg-white/72 px-4 text-sm font-semibold">
          <span className="text-lg leading-none">≡</span>
          Lọc
        </button>
      </div>
    </div>
  );
}
