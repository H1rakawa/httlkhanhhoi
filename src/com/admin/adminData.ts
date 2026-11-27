export const adminStats = [
  {
    icon: "community",
    title: "Tổng thành viên",
    key: "totalMembers",
    fallbackValue: "0",
    delta: "Đang hoạt động",
    tone: "success",
  },
  {
    icon: "document",
    title: "Số bài tập",
    key: "assignments",
    fallbackValue: "0",
    delta: "Tổng hiện có",
    tone: "success",
  },
  {
    icon: "book",
    title: "Tài liệu thư viện",
    key: "libraryResources",
    fallbackValue: "0",
    delta: "Trong thư viện",
    tone: "neutral",
  },
  {
    icon: "calendar",
    title: "Sự kiện sắp tới",
    key: "upcomingEvents",
    fallbackValue: "0",
    delta: "Từ hôm nay",
    tone: "neutral",
  },
] as const;

export const adminSidebarItems: Array<{
  href: string;
  label: string;
  icon: string;
  /** Chỉ quản trị viên thấy; giáo viên bị ẩn. */
  adminOnly?: boolean;
}> = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/member", label: "Thành viên", icon: "community", adminOnly: true },
  { href: "/admin/assignment", label: "Bài tập", icon: "document" },
  { href: "/admin/events", label: "Sự kiện", icon: "calendar" },
  { href: "/admin/news", label: "Tin tức", icon: "news" },
  { href: "/admin/preachout", label: "Truyền giảng", icon: "megaphone" },
  { href: "/admin/library", label: "Thư viện", icon: "book" },
  { href: "/admin/pray", label: "Cầu thay", icon: "hands" },
  { href: "/admin/contact", label: "Liên hệ", icon: "mail" },
];
