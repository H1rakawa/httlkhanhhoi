export type OutreachEvent = {
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: "Sắp diễn ra" | "Đang mở đăng ký" | "Đang chuẩn bị";
  capacity: string;
  image: string;
  description: string;
  schedule: string[];
  action: string;
  featured?: boolean;
};

export type OutreachResource = {
  title: string;
  meta: string;
  tone: string;
};

export type Testimony = {
  quote: string;
  name: string;
  role?: string;
  image?: string;
};

export const outreachEvents: OutreachEvent[] = [
  {
    title: "Chiến dịch Nụ cười Trẻ thơ",
    type: "Tình nguyện",
    date: "25 Tháng 12, 2024",
    time: "07:30 - 17:00",
    location: "Lâm Đồng, Việt Nam",
    status: "Sắp diễn ra",
    capacity: "42/60 tình nguyện viên",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=88",
    description:
      "Một ngày phục vụ trẻ em vùng cao qua quà Giáng sinh, sinh hoạt thiếu nhi và thăm hỏi gia đình khó khăn.",
    schedule: ["07:30 xuất phát", "10:00 thăm điểm nhóm", "14:00 sinh hoạt thiếu nhi"],
    action: "Đăng ký tham gia",
    featured: true,
  },
  {
    title: "Cơm ấm Tình thân",
    type: "Quyên góp",
    date: "Hằng tuần (Thứ 7)",
    time: "15:00 - 19:00",
    location: "TP. Hồ Chí Minh",
    status: "Đang mở đăng ký",
    capacity: "18/30 người phục vụ",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=88",
    description:
      "Chuẩn bị và trao những phần ăn ấm nóng cho người lao động, bệnh nhân và các hoàn cảnh cần nâng đỡ.",
    schedule: ["15:00 chuẩn bị phần ăn", "17:00 phân nhóm", "18:00 trao tặng"],
    action: "Xem chi tiết",
  },
  {
    title: "Lớp học Hy Vọng",
    type: "Đào tạo",
    date: "05 Tháng 01, 2025",
    time: "20:00 - 21:30",
    location: "Online Webinar",
    status: "Đang chuẩn bị",
    capacity: "120 chỗ trực tuyến",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=88",
    description:
      "Lớp hướng dẫn căn bản cho nhóm truyền giảng về lắng nghe, chăm sóc và chia sẻ niềm hy vọng cách phù hợp.",
    schedule: ["20:00 khai mạc", "20:20 huấn luyện", "21:00 hỏi đáp"],
    action: "Đăng ký tham gia",
  },
];

export const resources: OutreachResource[] = [
  { title: "Cẩm nang Tình nguyện viên", meta: "PDF • 4.2 MB", tone: "bg-[#eef0ff] text-[#6157ff]" },
  { title: "Slide Thuyết trình Cộng đồng", meta: "PPTX • 18.5 MB", tone: "bg-[#fff0f3] text-[#ff4d6d]" },
  { title: "Bộ ảnh Truyền thông 2024", meta: "ZIP • 120 MB", tone: "bg-[#fff4e8] text-[#ff7a45]" },
  { title: "Kịch bản Phỏng vấn Nhân chứng", meta: "DOCX • 1.1 MB", tone: "bg-[#f1f3f5] text-[#6b7280]" },
];

export const testimonies: Testimony[] = [
  {
    quote:
      "Khi tôi tham gia vào chiến dịch tại vùng cao, tôi không chỉ mang theo quà tặng mà còn nhận lại được những bài học quý giá về lòng nhân ái.",
    name: "Nguyễn Minh Anh",
    role: "Tình nguyện viên từ 2022",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=85",
  },
  {
    quote:
      "Một trải nghiệm thay đổi cuộc đời. Tôi đã gặp được những người bạn đồng hành tuyệt vời.",
    name: "Lê Văn Tùng",
  },
  {
    quote:
      "Cảm ơn HTTL. Khánh Hội vì đã tạo ra những hoạt động ý nghĩa và minh bạch.",
    name: "Bà Trần Thị Hoa",
  },
];

export const progressStats = [
  { label: "Người được tiếp cận", value: "1.280", detail: "+18% so với đợt trước" },
  { label: "Tình nguyện viên", value: "86", detail: "14 nhóm phục vụ" },
  { label: "Tài liệu đã gửi", value: "420", detail: "PDF, slide, video" },
];
