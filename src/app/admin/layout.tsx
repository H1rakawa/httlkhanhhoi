import type { Metadata } from "next";

/** Trang quản trị: không cho máy tìm kiếm lập chỉ mục. Quyền truy cập kiểm tra ở từng trang. */
export const metadata: Metadata = {
  title: {
    default: "Quản trị",
    template: "%s | Quản trị HTTL. Khánh Hội",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
