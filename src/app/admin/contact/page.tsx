import AdminShell from "@/com/admin/AdminShell";
import AdminContactContent from "@/com/admin/contact/AdminContactContent";
import { requireStaffPage } from "@/lib/admin/staff";

export const metadata = {
  title: "Hộp thư liên hệ | Quản trị HTTL Khánh Hội",
};

export default async function AdminContactPage() {
  // Trùng điều kiện RLS public.is_staff(): admin hoặc giáo viên đang hoạt động.
  const { account } = await requireStaffPage();

  return (
    <AdminShell account={account} activeHref="/admin/contact">
      <AdminContactContent />
    </AdminShell>
  );
}
