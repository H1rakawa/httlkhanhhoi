import AdminShell from "@/com/admin/AdminShell";
import AdminNewsContent from "@/com/admin/news/AdminNewsContent";
import type { AdminNewsPost } from "@/com/admin/news/adminNewsData";
import { getAdminNewsPosts } from "@/lib/admin/news";
import { requireStaffPage } from "@/lib/admin/staff";

export const metadata = {
  title: "Quản lý tin tức | Quản trị HTTL Khánh Hội",
};

export default async function AdminNewsPage() {
  const { account, accessToken } = await requireStaffPage();

  let posts: AdminNewsPost[] = [];
  let loadError: string | null = null;
  try {
    posts = await getAdminNewsPosts(accessToken);
  } catch {
    loadError = "Không tải được danh sách bài viết. Vui lòng tải lại trang.";
  }

  return (
    <AdminShell account={account} activeHref="/admin/news">
      <AdminNewsContent initialPosts={posts} loadError={loadError} />
    </AdminShell>
  );
}
