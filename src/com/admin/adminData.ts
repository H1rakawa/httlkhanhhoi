export const adminStats = [
  {
    icon: "community",
    title: "Tổng thành viên",
    value: "1,284",
    delta: "+12%",
    tone: "success",
  },
  {
    icon: "document",
    title: "Bài tập đã nộp",
    value: "452",
    delta: "+5%",
    tone: "success",
  },
  {
    icon: "calendar",
    title: "Sự kiện sắp tới",
    value: "08",
    delta: "Tuần này",
    tone: "neutral",
  },
  {
    icon: "bell",
    title: "Báo cáo mới",
    value: "03",
    delta: "Cần xử lý",
    tone: "danger",
  },
];

export const adminSidebarItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/member", label: "Thành viên", icon: "community" },
  { href: "/admin/pray", label: "Sự kiện", icon: "calendar" },
  { href: "/admin/library", label: "Thư viện", icon: "book" },
  { href: "/admin/exam", label: "Bài tập", icon: "document" },
];

export const adminQuickActions = [
  { label: "Thêm Thành Viên", icon: "community", primary: true },
  { label: "Tạo Bài Tập", icon: "document", primary: false, href: "/admin/exam/new" },
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
