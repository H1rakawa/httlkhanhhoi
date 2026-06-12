export type NewsCategory = "Tin tức" | "Thông báo" | "Bài chia sẻ";

export type NewsPost = {
  slug: string;
  title: string;
  category: NewsCategory;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
  image: "church" | "table" | "book" | "meeting" | "retreat" | "podcast";
  photo: string;
  featured?: boolean;
};

export const newsCategories = ["Tất cả", "Tin tức", "Thông báo", "Bài chia sẻ"] as const;

export const newsPosts: NewsPost[] = [
  {
    slug: "le-ky-niem-10-nam-thanh-lap-hoi-thanh",
    title: "Lễ Kỷ Niệm 10 Năm Thành Lập Hội Thánh",
    category: "Thông báo",
    date: "2024-04-12",
    author: "Ban Truyền Thông",
    excerpt:
      "Hãy cùng chúng tôi nhìn lại chặng đường 10 năm đầy ơn phước và những dự định phía trước.",
    content: [
      "HTTL. Khánh Hội sẽ tổ chức lễ kỷ niệm 10 năm thành lập với thì giờ thờ phượng, lời chứng và phần nhìn lại hành trình phục vụ cộng đồng.",
      "Chương trình cũng là dịp để các thế hệ trong hội thánh cùng kết nối, cảm tạ và cầu nguyện cho những bước đi mới trong tương lai.",
      "Kính mời quý con cái Chúa, thân hữu và các gia đình sắp xếp thời gian tham dự.",
    ],
    image: "church",
    photo:
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1400&q=86",
    featured: true,
  },
  {
    slug: "khoi-dong-du-an-anh-sang-do-thi",
    title: 'Khởi Động Dự Án "Ánh Sáng Đô Thị"',
    category: "Tin tức",
    date: "2024-04-08",
    author: "Nhóm Thiện Nguyện",
    excerpt:
      "Chương trình tình nguyện hỗ trợ các gia đình khó khăn tại khu vực trung tâm thành phố.",
    content: [
      "Dự án Ánh Sáng Đô Thị tập trung vào việc thăm hỏi, hỗ trợ thực phẩm và kết nối nguồn lực cho các gia đình cần được đồng hành.",
      "Trong giai đoạn đầu, đội ngũ thiện nguyện sẽ khảo sát nhu cầu tại các khu dân cư lân cận và tổ chức các buổi phục vụ định kỳ.",
      "Hội thánh khích lệ các thành viên đăng ký tham gia theo khả năng và thời gian phù hợp.",
    ],
    image: "table",
    photo:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=86",
  },
  {
    slug: "su-tinh-lang-giua-the-gioi-on-ao",
    title: "Sự Tĩnh Lặng Giữa Thế Giới Ồn Ào",
    category: "Bài chia sẻ",
    date: "2024-04-05",
    author: "Mục sư Quản nhiệm",
    excerpt:
      "Chia sẻ về cách duy trì đời sống tâm linh và sự bình an nội tâm trong nhịp sống hối hả hiện đại.",
    content: [
      "Sự tĩnh lặng không phải là trốn khỏi đời sống, nhưng là trở về với Chúa giữa những bộn bề thường ngày.",
      "Khi dành chỗ cho cầu nguyện, lắng nghe và suy ngẫm Lời Chúa, chúng ta học cách bước đi với sự bình an vững vàng hơn.",
      "Mỗi ngày chỉ cần một khoảng lặng nhỏ cũng có thể trở thành điểm neo cho tâm hồn.",
    ],
    image: "book",
    photo:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1400&q=86",
  },
  {
    slug: "tuyen-cong-tac-vien-ban-truyen-thong",
    title: "Tuyển Cộng Tác Viên Ban Truyền Thông",
    category: "Thông báo",
    date: "2024-04-01",
    author: "Ban Truyền Thông",
    excerpt:
      "Cơ hội để các bạn trẻ đam mê sáng tạo nội dung góp kỹ năng của mình cho sự phát triển chung.",
    content: [
      "Ban Truyền Thông đang tìm kiếm cộng tác viên cho các mảng chụp ảnh, viết bài, thiết kế và quản lý nội dung số.",
      "Các bạn chưa có nhiều kinh nghiệm vẫn có thể tham gia nếu có tinh thần học hỏi và phục vụ.",
      "Buổi định hướng đầu tiên sẽ được thông báo trong lịch sinh hoạt tháng này.",
    ],
    image: "meeting",
    photo:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=86",
  },
  {
    slug: "chuyen-di-retreat-tro-ve-voi-thien-nhien",
    title: "Chuyến Đi Retreat: Trở Về Với Thiên Nhiên",
    category: "Tin tức",
    date: "2024-03-28",
    author: "Ban Chăm Sóc",
    excerpt:
      "Tổng kết hành trình kết nối tâm hồn và thiên nhiên tại khu bảo tồn quốc gia tuần vừa qua.",
    content: [
      "Chuyến retreat đã đem đến không gian nghỉ ngơi, cầu nguyện và kết nối sâu sắc cho các thành viên tham dự.",
      "Các hoạt động nhóm nhỏ, đi bộ thiên nhiên và chia sẻ cuối ngày giúp mọi người nhìn lại nhịp sống của mình.",
      "Hội thánh dự kiến sẽ tổ chức thêm những kỳ retreat tương tự trong năm tới.",
    ],
    image: "retreat",
    photo:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=86",
  },
  {
    slug: "podcast-moi-loi-song-moi-ngay",
    title: 'Podcast Mới: "Lối Sống Mỗi Ngày"',
    category: "Thông báo",
    date: "2024-03-25",
    author: "Đội Podcast",
    excerpt:
      "Lắng nghe những chia sẻ sâu sắc về đức tin thông qua chuỗi podcast mới phát sóng định kỳ.",
    content: [
      "Chuỗi podcast Lối Sống Mỗi Ngày được xây dựng để đồng hành cùng thành viên trong tuần qua những chủ đề gần gũi.",
      "Mỗi tập kéo dài khoảng 15 phút, gồm suy ngẫm Kinh Thánh, câu chuyện thực tế và lời cầu nguyện ngắn.",
      "Các tập đầu tiên sẽ được đăng trên kênh truyền thông của hội thánh.",
    ],
    image: "podcast",
    photo:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=86",
  },
  {
    slug: "lop-kinh-thanh-can-ban-khoa-moi",
    title: "Lớp Kinh Thánh Căn Bản Khóa Mới",
    category: "Tin tức",
    date: "2024-03-18",
    author: "Ban Đào Tạo",
    excerpt:
      "Khóa học căn bản dành cho thân hữu và thành viên mới muốn tìm hiểu nền tảng đức tin.",
    content: [
      "Lớp Kinh Thánh Căn Bản sẽ khai giảng vào đầu tháng tới với các chủ đề về đức tin, cầu nguyện và đời sống hội thánh.",
      "Chương trình phù hợp cho người mới tin Chúa, thân hữu đang tìm hiểu và các thành viên muốn ôn lại nền tảng.",
    ],
    image: "book",
    photo:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=86",
  },
  {
    slug: "cap-nhat-quy-cau-thay-thang-tu",
    title: "Cập Nhật Quỹ Cầu Thay Tháng Tư",
    category: "Bài chia sẻ",
    date: "2024-03-12",
    author: "Nhóm Cầu Nguyện",
    excerpt:
      "Những lời chứng nhỏ từ cộng đồng cầu thay và lời mời cùng tiếp tục nâng đỡ nhau.",
    content: [
      "Trong tháng qua, nhóm cầu nguyện đã tiếp nhận nhiều nhu cầu và chứng kiến những sự nâng đỡ rất cụ thể trong đời sống thành viên.",
      "Chúng tôi khích lệ mỗi người tiếp tục gửi nhu cầu cầu thay và dành thời gian cầu nguyện cho nhau.",
    ],
    image: "church",
    photo:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1400&q=86",
  },
];
