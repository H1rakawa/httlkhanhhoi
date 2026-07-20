import DashboardIcon from "@/com/dashboard/DashboardIcon";

export default function AdminMemberHeader() {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-extrabold text-[#0f172a]">
          Quản lý thành viên
        </p>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#5d6773]">
          Quản lý quyền hạn và trạng thái của cộng đồng Serene Grace.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#0066cc] px-7 text-sm font-extrabold text-white shadow-[0_18px_38px_rgba(0,102,204,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#0077ee]"
      >
        <DashboardIcon name="community" className="h-5 w-5" />
        Thêm thành viên mới
      </button>
    </header>
  );
}
