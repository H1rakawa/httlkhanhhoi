const filters = ["Tất cả", "Của tôi", "Đang cầu nguyện", "Đã nhận lời"];

export default function PrayerFilterBar() {
  return (
    <div className="liquid-glass flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2 rounded-[14px] border border-white/80 bg-white/46 p-1.5">
        {filters.map((item, index) => (
          <button
            key={item}
            className={[
              "h-10 rounded-[10px] px-5 text-sm font-semibold transition-colors",
              index === 0
                ? "bg-[#111113] text-white shadow-sm"
                : "text-[#6e6e73] hover:bg-white/58",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="prayer-search">
        Tìm kiếm lời cầu thay
      </label>
      <input
        id="prayer-search"
        type="search"
        placeholder="Tìm kiếm lời cầu thay..."
        className="h-11 rounded-[12px] border border-white/80 bg-white/58 px-4 text-sm outline-none placeholder:text-[#8a929c] focus:border-[#6c4cff] md:w-80"
      />
    </div>
  );
}
