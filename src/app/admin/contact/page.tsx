import AdminShell from "@/com/admin/AdminShell";
import AdminContactContent from "@/com/admin/contact/AdminContactContent";
import { requireStaffPage } from "@/lib/admin/staff";

export const metadata = {
  title: "Hộp thư liên hệ",
};

export default async function AdminContactPage() {
  // Trùng điều kiện RLS public.is_staff(): ban mục vụ đang hoạt động.
  const { account } = await requireStaffPage();

  return (
    <AdminShell account={account} activeHref="/admin/contact">
      <AdminContactContent />
    </AdminShell>
  );
}
