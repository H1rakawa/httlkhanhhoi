export type Assignment = {
  id: string;
  title: string;
  subtitle: string;
  status: "Chưa làm" | "Đã nộp";
  icon: "book" | "document" | "group";
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const assignments: Assignment[] = [
  {
    id: "bible-week-4",
    title: "Tìm hiểu Kinh Thánh - Tuần 4",
    subtitle: "Hạn nộp: Còn 2 ngày",
    status: "Chưa làm",
    icon: "book",
  },
  {
    id: "retreat-reflection",
    title: "Bài thu hoạch Retreat",
    subtitle: "Đã nộp vào: Hôm qua",
    status: "Đã nộp",
    icon: "document",
  },
  {
    id: "small-group-discussion",
    title: "Thảo luận Nhóm nhỏ",
    subtitle: "Hạn nộp: 25/06/2026",
    status: "Chưa làm",
    icon: "group",
  },
];

export const notifications: DashboardNotification[] = [
  {
    id: "event-added",
    title: "Sự kiện mới được thêm vào lịch",
    body: 'Workshop "Kỹ năng Lãnh đạo" sẽ diễn ra vào tuần tới.',
    time: "10 phút trước",
    unread: true,
  },
  {
    id: "assignment-score",
    title: "Điểm bài tập của bạn đã có",
    body: 'Bạn đạt 9.0 cho bài "Phân tích Văn bản". Chúc mừng!',
    time: "2 giờ trước",
    unread: false,
  },
  {
    id: "library-update",
    title: "Cập nhật tài liệu Thư viện",
    body: 'Bộ sưu tập "Kinh điển Mùa Chay" vừa được cập nhật thêm 5 đầu sách.',
    time: "Hôm qua",
    unread: false,
  },
];
