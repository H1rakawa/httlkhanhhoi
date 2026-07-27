export type SuggestedResource = {
  id: string;
  title: string;
  type: string;
  description: string;
  icon: "book" | "video";
  href: string;
};

export type DashboardPrayerRequest = {
  id: string;
  author: string;
  category: string;
  excerpt: string;
  initials: string;
  href: string;
};

export const suggestedResources: SuggestedResource[] = [
  {
    id: "stillness-strength",
    title: "Sức mạnh của Sự tĩnh lặng",
    type: "Sách hướng dẫn tâm linh",
    description:
      "Khám phá cách tìm thấy sự bình an nội tại trong thế giới ồn ào hiện đại.",
    icon: "book",
    href: "/library",
  },
  {
    id: "early-church-history",
    title: "Lịch sử Hội thánh sơ khai",
    type: "Bài giảng video",
    description:
      "Hành trình tìm hiểu về nguồn gốc và sự phát triển của cộng đồng đức tin.",
    icon: "video",
    href: "/library",
  },
];

export const dashboardPrayerRequests: DashboardPrayerRequest[] = [
  {
    id: "minh-tam-health",
    author: "Minh Tâm",
    category: "Cầu nguyện cho sức khỏe",
    excerpt:
      "Xin cộng đồng cùng hiệp ý cầu nguyện cho mẹ của con đang điều trị tại bệnh viện, xin Chúa ban sự chữa lành và bình an...",
    initials: "MT",
    href: "/pray",
  },
  {
    id: "anonymous-family-peace",
    author: "Ẩn danh",
    category: "Bình an trong gia đình",
    excerpt:
      "Cầu xin sự dẫn dắt của Chúa trong những quyết định quan trọng của gia đình con trong tuần tới, xin Ngài ban sự khôn ngoan...",
    initials: "AD",
    href: "/pray",
  },
];
