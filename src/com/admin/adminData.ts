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

// "Sự kiện" và "Thư viện" sẽ thêm lại khi có trang /admin/events và /admin/library
// (trước đây "Sự kiện" trỏ nhầm sang /admin/pray, còn "Thư viện" dẫn tới trang 404).
export const adminSidebarItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/member", label: "Thành viên", icon: "community" },
  { href: "/admin/assignment", label: "Bài tập", icon: "document" },
  { href: "/admin/pray", label: "Cầu thay", icon: "hands" },
  { href: "/admin/contact", label: "Liên hệ", icon: "mail" },
];
