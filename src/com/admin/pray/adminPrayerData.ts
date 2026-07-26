export type AdminPrayerStatus = "pending" | "approved" | "answered";

export type AdminPrayerCategory = "Sức khỏe" | "Gia đình" | "Tâm linh" | "Tài chính";

export type AdminPrayerItem = {
  id: string;
  title: string;
  senderName: string;
  senderEmail: string;
  submittedDate: string;
  category: AdminPrayerCategory;
  status: AdminPrayerStatus;
  content: string;
  avatarUrl: string;
};

export const adminPrayerStats = [
  {
    label: "Tổng lời cầu nguyện",
    value: "1,284",
    icon: "document",
    tone: "blue",
  },
  {
    label: "Chờ duyệt",
    value: "12",
    icon: "clipboard",
    tone: "gold",
  },
  {
    label: "Công khai",
    value: "1,272",
    icon: "eye",
    tone: "blue",
  },
] as const;

export const adminPrayerItems: AdminPrayerItem[] = [
  {
    id: "nguyen-thu-thao",
    title: "Cầu nguyện cho sức khỏe của mẹ",
    senderName: "Nguyễn Thu Thảo",
    senderEmail: "thao.nguyen@email.com",
    submittedDate: "14/10/2023",
    category: "Sức khỏe",
    status: "pending",
    content: "Xin Chúa chữa lành cho mẹ con trong thời gian hồi phục...",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "tran-van-nam",
    title: "Xin Chúa giữ gìn gia đình",
    senderName: "Trần Văn Nam",
    senderEmail: "nam.tran@email.com",
    submittedDate: "13/10/2023",
    category: "Gia đình",
    status: "approved",
    content: "Cầu nguyện cho sự bình an của gia đình trong mùa này...",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "le-minh-tuan",
    title: "Thêm sức mạnh trong đời sống thuộc linh",
    senderName: "Lê Minh Tuấn",
    senderEmail: "tuan.le@email.com",
    submittedDate: "12/10/2023",
    category: "Tâm linh",
    status: "approved",
    content: "Xin Chúa ban thêm sức mạnh và sự khôn ngoan...",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "pham-thi-mai",
    title: "Xin sự tiếp trợ cho tài chính gia đình",
    senderName: "Phạm Thị Mai",
    senderEmail: "mai.pham@email.com",
    submittedDate: "12/10/2023",
    category: "Tài chính",
    status: "answered",
    content: "Cầu xin sự tiếp trợ từ Chúa cho gia đình con...",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  },
];

export const adminPrayerCategoryOptions = [
  "Tất cả danh mục",
  "Sức khỏe",
  "Gia đình",
  "Tâm linh",
  "Tài chính",
] as const;

export const adminPrayerStatusOptions = [
  { value: "all", label: "Trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Công khai" },
  { value: "answered", label: "Đã nhận lời" },
] as const;
