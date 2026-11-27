import AdminShell from "@/com/admin/AdminShell";
import AdminLibraryContent from "@/com/admin/library/AdminLibraryContent";
import type { AdminResource } from "@/com/admin/library/adminLibraryData";
import { getAdminResources } from "@/lib/admin/library";
import { requireStaffPage } from "@/lib/admin/staff";

export const metadata = {
  title: "Quản lý thư viện",
};

type AdminLibraryPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function AdminLibraryPage({ searchParams }: AdminLibraryPageProps) {
  const { account, accessToken } = await requireStaffPage();
  const { category } = await searchParams;

  let resources: AdminResource[] = [];
  let loadError: string | null = null;
  try {
    resources = await getAdminResources(accessToken);
  } catch {
    loadError = "Không tải được thư viện. Vui lòng tải lại trang.";
  }

  return (
    <AdminShell account={account} activeHref="/admin/library">
      <AdminLibraryContent
        initialResources={resources}
        loadError={loadError}
        initialCategory={category && /^[a-z0-9-]+$/.test(category) ? category : "all"}
      />
    </AdminShell>
  );
}
