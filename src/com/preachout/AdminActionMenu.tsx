import { DotsIcon } from "@/com/preachout/PreachoutIcons";

export default function AdminActionMenu() {
  return (
    <div className="group relative">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/64 text-[#424245] shadow-sm transition-colors hover:bg-white"
        aria-label="Quản trị hoạt động truyền giảng"
      >
        <DotsIcon />
      </button>
      <div className="pointer-events-none absolute right-0 top-11 z-20 w-48 translate-y-2 rounded-[16px] border border-white/80 bg-white/92 p-2 text-sm opacity-0 shadow-[0_20px_44px_rgba(31,48,70,0.18)] backdrop-blur-xl transition-all group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        {["Chỉnh sửa sự kiện", "Xem đăng ký", "Xuất báo cáo"].map((item) => (
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
