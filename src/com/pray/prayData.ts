export type PrayerPrivacy = "Công khai" | "Riêng tư";
export type PrayerStatus = "Đang cầu nguyện" | "Đã nhận lời";

export type PrayerComment = {
  name: string;
  time: string;
  message: string;
  image?: string;
};

export type PrayerRequest = {
  id: string;
  title: string;
  author: string;
  time: string;
  privacy: PrayerPrivacy;
  status: PrayerStatus;
  prayedCount: number;
  excerpt: string;
  content: string;
  image: string;
  comments: PrayerComment[];
};

export const prayerRequests: PrayerRequest[] = [
  {
    id: "family-health",
    title: "Cầu nguyện cho sức khỏe gia đình",
    author: "Minh Tuấn",
    time: "2 giờ trước",
    privacy: "Công khai",
    status: "Đang cầu nguyện",
    prayedCount: 128,
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=240&q=85",
    excerpt:
      "Con xin mọi người hiệp ý cầu nguyện cho mẹ con đang trong giai đoạn hồi phục sau phẫu thuật.",
    content:
      "Con xin mọi người hiệp ý cầu nguyện cho mẹ con đang trong giai đoạn hồi phục sau phẫu thuật. Mong rằng ơn phước sẽ luôn ở cùng bà để bà sớm bình phục và quay lại với cuộc sống thường nhật. Con cũng xin cầu nguyện cho các bác sĩ và điều dưỡng đang trực tiếp chăm sóc cho mẹ con, xin ban cho họ sự minh mẫn và đôi bàn tay khéo léo.",
    comments: [
      {
        name: "Bác Hùng",
        time: "1 giờ trước",
        message: "Hiệp ý cùng con. Xin Chúa ban bình an và sự chữa lành cho mẹ con.",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85",
      },
      {
        name: "Phương Anh",
        time: "45 phút trước",
        message: "Mạnh mẽ lên nhé bạn. Mọi chuyện rồi sẽ tốt đẹp thôi.",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85",
      },
    ],
  },
  {
    id: "exam-thanks",
    title: "Tạ ơn về kỳ thi vừa qua",
    author: "Khánh Linh",
    time: "5 giờ trước",
    privacy: "Công khai",
    status: "Đã nhận lời",
    prayedCount: 42,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=85",
    excerpt:
      "Thật hạnh phúc khi được thông báo rằng mình đã vượt qua kỳ thi chứng chỉ với kết quả tốt.",
    content:
      "Thật hạnh phúc khi được thông báo rằng mình đã vượt qua kỳ thi chứng chỉ với kết quả tốt. Cảm ơn mọi người đã đồng hành và cầu thay cho mình trong suốt thời gian ôn luyện vất vả vừa qua.",
    comments: [
      {
        name: "Mai Chi",
        time: "3 giờ trước",
        message: "Tạ ơn Chúa cùng em. Mong em tiếp tục bước đi vững vàng.",
      },
    ],
  },
  {
    id: "work-guidance",
    title: "Xin Chúa hướng dẫn trong công việc mới",
    author: "Hà My",
    time: "Hôm qua",
    privacy: "Riêng tư",
    status: "Đang cầu nguyện",
    prayedCount: 63,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=85",
    excerpt:
      "Mình sắp bước vào môi trường làm việc mới và cần sự bình an để học hỏi, thích nghi.",
    content:
      "Mình sắp bước vào môi trường làm việc mới và cần sự bình an để học hỏi, thích nghi. Xin Chúa giúp mình có sự khôn ngoan trong giao tiếp, tinh thần phục vụ và lòng khiêm nhường.",
    comments: [],
  },
];
