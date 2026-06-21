export type LibraryResource = {
  id: string;
  title: string;
  description: string;
  type: "PDF" | "Video" | "Sách" | "Bài giảng" | "Âm thanh";
  url: string;
  image: string;
  createdAt: string;
  embedUrl?: string;
  source?: "supabase" | "youtube" | "fallback";
  videoId?: string;
};

export const libraryTypes = [
  "Tất cả",
  "PDF",
  "Video",
  "Sách",
  "Bài giảng",
  "Âm thanh",
] as const;

export const fallbackResources: LibraryResource[] = [
  {
    id: "quiet-time-guide",
    title: "Hướng dẫn giờ tĩnh nguyện",
    description:
      "Phương pháp đọc Kinh Thánh, cầu nguyện và ghi chú để nuôi dưỡng đời sống tâm linh mỗi ngày.",
    type: "PDF",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-06-12",
  },
  {
    id: "freedom-sermon",
    title: "Tự do trong ân điển",
    description:
      "Bài giảng về việc được giải phóng khỏi những áp lực vô hình để sống vững vàng trong đức tin.",
    type: "Video",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-06-10",
  },
  {
    id: "faith-foundations",
    title: "Nền tảng đức tin",
    description:
      "Tài liệu nhập môn trình bày những nền tảng quan trọng cho hành trình trưởng thành thuộc linh.",
    type: "Sách",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-06-08",
  },
  {
    id: "prayer-music",
    title: "Nhạc Thánh cầu nguyện",
    description:
      "Tuyển tập âm nhạc nhẹ nhàng giúp tạo không gian tĩnh lặng cho cầu nguyện và suy ngẫm.",
    type: "Âm thanh",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-06-05",
  },
  {
    id: "community-calendar",
    title: "Lịch sự kiện cộng đồng",
    description:
      "Tổng hợp các ngày lễ, sự kiện và chủ đề sinh hoạt quan trọng trong năm của Hội Thánh.",
    type: "PDF",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-06-03",
  },
  {
    id: "roots-of-faith",
    title: "Nguồn gốc đức tin",
    description:
      "Chuỗi bài học chuyên sâu dành cho thành viên muốn khám phá lịch sử và căn nguyên đức tin.",
    type: "Bài giảng",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-06-01",
  },
  {
    id: "serving-together",
    title: "Cùng nhau phục vụ",
    description:
      "Những câu chuyện và hướng dẫn thực tế để bắt đầu hành trình phục vụ cộng đồng.",
    type: "Video",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-05-28",
  },
  {
    id: "family-devotion",
    title: "Tĩnh nguyện gia đình",
    description:
      "Các chủ đề trò chuyện và suy ngẫm giúp gia đình cùng lớn lên trong yêu thương.",
    type: "Sách",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-05-25",
  },
  {
    id: "hope-in-trials",
    title: "Hy vọng giữa thử thách",
    description:
      "Bài chia sẻ khích lệ đức tin và sự bền lòng trong những mùa đầy biến động.",
    type: "Bài giảng",
    url: "#",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=86",
    createdAt: "2026-05-22",
  },
];

export function normalizeResourceType(type: string): LibraryResource["type"] {
  const normalized = type.trim().toLowerCase();
  if (normalized.includes("video")) return "Video";
  if (normalized.includes("audio") || normalized.includes("âm")) return "Âm thanh";
  if (normalized.includes("book") || normalized.includes("sách")) return "Sách";
  if (normalized.includes("sermon") || normalized.includes("bài giảng")) {
    return "Bài giảng";
  }
  return "PDF";
}
