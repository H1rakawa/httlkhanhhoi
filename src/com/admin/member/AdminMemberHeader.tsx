import AdminAddMemberButton from "@/com/admin/AdminAddMemberButton";

export default function AdminMemberHeader({
  onMemberCreated,
}: {
  onMemberCreated?: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:gap-5">
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-[#0f172a]">
          Quản lý thành viên
        </p>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#5d6773]">
          Quản lý quyền hạn và trạng thái của cộng đồng Serene Grace.
        </p>
      </div>

      <AdminAddMemberButton onCreated={onMemberCreated} />
    </header>
  );
}
