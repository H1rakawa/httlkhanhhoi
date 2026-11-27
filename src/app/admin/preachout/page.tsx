import AdminShell from "@/com/admin/AdminShell";
import AdminPreachoutContent from "@/com/admin/preachout/AdminPreachoutContent";
import { getAdminEvents } from "@/lib/admin/events";
import { requireStaffPage } from "@/lib/admin/staff";
import { countOutreachResources, getAdminTestimonies } from "@/lib/admin/testimonies";

export const metadata = {
  title: "Quản lý truyền giảng",
};

async function settle<T>(promise: Promise<T>, fallback: T) {
  try {
    return { data: await promise, failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}

export default async function AdminPreachoutPage() {
  const { account, accessToken } = await requireStaffPage();

  const [testimonies, events, resources] = await Promise.all([
    settle(getAdminTestimonies(accessToken), []),
    settle(getAdminEvents(accessToken), []),
    settle(countOutreachResources(accessToken), { total: 0, published: 0 }),
  ]);

  return (
    <AdminShell account={account} activeHref="/admin/preachout">
      <AdminPreachoutContent
        initialTestimonies={testimonies.data}
        outreachEvents={events.data.filter((event) => event.type === "outreach")}
        resourceCounts={resources.data}
        loadError={
          testimonies.failed || events.failed || resources.failed
            ? "Một phần dữ liệu chưa tải được. Vui lòng tải lại trang."
            : null
        }
      />
    </AdminShell>
  );
}
