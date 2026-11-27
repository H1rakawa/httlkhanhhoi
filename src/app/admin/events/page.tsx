import AdminShell from "@/com/admin/AdminShell";
import AdminEventsContent from "@/com/admin/events/AdminEventsContent";
import type { AdminEvent } from "@/com/admin/events/adminEventData";
import { getAdminEvents } from "@/lib/admin/events";
import { requireStaffPage } from "@/lib/admin/staff";

export const metadata = {
  title: "Quản lý sự kiện | Quản trị HTTL Khánh Hội",
};

type AdminEventsPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  const { account, accessToken } = await requireStaffPage();
  const { type } = await searchParams;

  let events: AdminEvent[] = [];
  let loadError: string | null = null;
  try {
    events = await getAdminEvents(accessToken);
  } catch {
    loadError = "Không tải được danh sách sự kiện. Vui lòng tải lại trang.";
  }

  return (
    <AdminShell account={account} activeHref="/admin/events">
      <AdminEventsContent
        initialEvents={events}
        loadError={loadError}
        initialType={type === "outreach" || type === "regular" ? type : "all"}
      />
    </AdminShell>
  );
}
