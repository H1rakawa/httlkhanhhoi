export type CalendarEvent = {
  id: string;
  title: string;
  category: "Thờ phượng" | "Đào tạo" | "Thiện nguyện" | "Giới trẻ";
  date: string;
  endTime: string;
  location: string;
  description: string;
  image: "worship" | "workshop" | "charity" | "youth";
  capacity?: number;
  registered?: number;
  reminderAvailable?: boolean;
};

export const eventCategories = [
  "Tất cả",
  "Thờ phượng",
  "Đào tạo",
  "Thiện nguyện",
  "Giới trẻ",
] as const;

type LiveEventTemplate = Omit<CalendarEvent, "date"> & {
  offsetDays: number;
  time: string;
};

const liveEventTemplates: LiveEventTemplate[] = [
  {
    id: "worship-night",
    title: 'Đêm Nhạc Thánh: "Ân Điển Là Làng"',
    category: "Thờ phượng",
    offsetDays: 2,
    time: "19:30",
    endTime: "21:00",
    location: "Hội trường chính - HTTL. Khánh Hội",
    description:
      "Một buổi tối đặc biệt dành cho sự thờ phượng, âm nhạc tĩnh lặng và cộng đồng cùng hướng lòng về mùa Giáng Sinh.",
    image: "worship",
    capacity: 180,
    registered: 124,
    reminderAvailable: true,
  },
  {
    id: "leadership-workshop",
    title: 'Workshop: "Lãnh Đạo Phục Vụ"',
    category: "Đào tạo",
    offsetDays: 7,
    time: "09:00",
    endTime: "12:00",
    location: "Phòng học 2",
    description:
      "Buổi học thực tế cho các trưởng nhóm và tình nguyện viên về tinh thần lãnh đạo phục vụ trong hội thánh.",
    image: "workshop",
    capacity: 40,
    registered: 31,
    reminderAvailable: true,
  },
  {
    id: "winter-charity",
    title: 'Chương Trình: "Ấm Áp Mùa Đông"',
    category: "Thiện nguyện",
    offsetDays: 14,
    time: "08:00",
    endTime: "12:00",
    location: "Sân sinh hoạt cộng đồng",
    description:
      "Cùng chuẩn bị phần quà, thăm hỏi và chia sẻ sự ấm áp với các gia đình cần được nâng đỡ trong khu vực.",
    image: "charity",
    capacity: 80,
    registered: 72,
    reminderAvailable: true,
  },
  {
    id: "youth-night",
    title: "Đêm Kết Nối Giới Trẻ",
    category: "Giới trẻ",
    offsetDays: 4,
    time: "18:30",
    endTime: "20:30",
    location: "Phòng sinh hoạt giới trẻ",
    description:
      "Không gian gặp gỡ, chia sẻ đức tin và kết nối bạn bè dành cho các bạn trẻ trong hội thánh.",
    image: "youth",
    capacity: 60,
    registered: 45,
  },
  {
    id: "prayer-morning",
    title: "Cầu Nguyện Buổi Sáng",
    category: "Thờ phượng",
    offsetDays: 0,
    time: "06:30",
    endTime: "07:30",
    location: "Nhà nguyện nhỏ",
    description:
      "Bắt đầu tháng mới bằng thì giờ cầu nguyện chung, lắng nghe và nâng đỡ nhau trong đức tin.",
    image: "worship",
    reminderAvailable: true,
  },
  {
    id: "family-class",
    title: "Lớp Nền Tảng Gia Đình",
    category: "Đào tạo",
    offsetDays: 21,
    time: "19:00",
    endTime: "20:30",
    location: "Phòng học 1",
    description:
      "Lớp học giúp các gia đình trẻ xây dựng nhịp sống yêu thương, lắng nghe và trưởng thành cùng nhau.",
    image: "workshop",
    capacity: 35,
    registered: 20,
  },
];

function toLocalDateTime(date: Date, time: string) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T${time}:00`;
}

export function getLiveCalendarEvents(referenceDate = new Date()): CalendarEvent[] {
  const startOfToday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  return liveEventTemplates.map(({ offsetDays, time, ...event }) => {
    const eventDate = new Date(startOfToday);
    eventDate.setDate(startOfToday.getDate() + offsetDays);

    return {
      ...event,
      date: toLocalDateTime(eventDate, time),
    };
  });
}
