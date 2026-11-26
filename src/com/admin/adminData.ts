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

export const adminSidebarItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/member", label: "Thành viên", icon: "community" },
  { href: "/admin/assignment", label: "Bài tập", icon: "document" },
  { href: "/admin/pray", label: "Cầu thay", icon: "hands" },
  { href: "/admin/pray", label: "Sự kiện", icon: "calendar" },
  { href: "/admin/library", label: "Thư viện", icon: "book" },
  { href: "/admin/contact", label: "Liên hệ", icon: "mail" },
];

export const adminQuickActions = [
  { label: "Thêm Thành Viên", icon: "community", primary: true },
  { label: "Tạo Bài Tập", icon: "document", primary: false, href: "/admin/assignment/new" },
  { label: "Đăng Sự Kiện", icon: "calendar", primary: false },
];

export const recentAdminActivities = [
  {
    name: "Minh Tuấn",
    body: 'đã nộp bài tập "Thiên và Đời Sống"',
    time: "10 phút trước",
    status: "Đã nộp",
    tone: "green",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Hệ thống",
    body: "đã thêm 5 thành viên mới vào nhóm cộng đồng",
    time: "2 giờ trước",
    status: "Hệ thống",
    tone: "slate",
    avatar: null,
  },
  {
    name: "Khánh Linh",
    body: 'đã đăng ký sự kiện "Gặp gỡ bình minh"',
    time: "5 giờ trước",
    status: "Đăng ký",
    tone: "violet",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
];

export const adminAlerts = [
  {
    title: "Bảo mật hệ thống",
    body: "Phát hiện đăng nhập bất thường từ IP lạ.",
    action: "Chi tiết",
    tone: "red",
  },
  {
    title: "Cần phê duyệt tài liệu",
    body: "Có 3 tài liệu mới từ cộng tác viên đang chờ kiểm duyệt nội dung.",
    action: "Đi tới duyệt",
    tone: "dark",
  },
];

export const adminProgress = [
  { label: "Số hóa thư viện", value: 75, tone: "dark" },
  { label: "Đăng ký sự kiện", value: 40, tone: "blue" },
];
