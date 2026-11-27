import Link from "next/link";
import AdminAddMemberButton from "@/com/admin/AdminAddMemberButton";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

const linkClassName =
  "flex h-11 items-center gap-2 rounded-full border border-white/76 bg-white/76 px-6 text-sm font-extrabold text-[#3d454d] no-underline shadow-[0_14px_30px_rgba(31,48,70,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5";

export default function AdminQuickActions({
  pendingPrayers,
  canManageMembers = true,
}: {
  pendingPrayers: number | null;
  canManageMembers?: boolean;
}) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center">
      <p className="text-sm font-bold text-[#252b31]">Thao tác nhanh</p>
      <div className="flex flex-wrap gap-3 md:gap-4">
        {canManageMembers && (
          <AdminAddMemberButton
            label="Thêm Thành Viên"
            className="flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-6 text-sm font-extrabold text-white shadow-[0_18px_34px_rgba(0,102,204,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0077ee]"
          />
        )}
        <Link href="/admin/assignment/new" className={linkClassName}>
          <DashboardIcon name="document" className="h-5 w-5" />
          Tạo Bài Tập
        </Link>
        <Link href="/admin/pray" className={linkClassName}>
          <DashboardIcon name="hands" className="h-5 w-5" />
          Duyệt Cầu Thay
          {!!pendingPrayers && (
            <span className="rounded-full bg-[#ff7a00] px-2 py-0.5 text-xs font-extrabold text-white">
              {pendingPrayers}
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
