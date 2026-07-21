import AdminAddMemberButton from "@/com/admin/AdminAddMemberButton";

export default function AdminMemberHeader({
  onMemberCreated,
}: {
  onMemberCreated?: () => void;
}) {
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

      <AdminAddMemberButton onCreated={onMemberCreated} />
    </header>
  );
}
