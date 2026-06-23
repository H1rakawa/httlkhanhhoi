export default function PrayAdminActionMenu() {
  return (
    <div className="group relative">
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#7b8490] transition-colors hover:bg-white/70"
        aria-label="Quản trị lời cầu thay"
      >
        <span className="text-2xl leading-none">⋮</span>
      </button>
      <div className="pointer-events-none absolute right-0 top-9 z-20 w-44 translate-y-2 rounded-[16px] border border-white/80 bg-white/94 p-2 text-sm opacity-0 shadow-[0_20px_44px_rgba(31,48,70,0.18)] backdrop-blur-xl transition-all group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        {["Ẩn lời cầu thay", "Đánh dấu hoàn tất", "Xóa vi phạm"].map((item) => (
          <button
            key={item}
            className="block w-full rounded-[10px] px-3 py-2 text-left font-semibold text-[#424245] hover:bg-[#f1f5f9]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
