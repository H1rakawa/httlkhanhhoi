export type AssignmentStatus =
  | "Chưa bắt đầu"
  | "Đang thực hiện"
  | "Đã nộp"
  | "Đã chấm"
  | "Trễ hạn";

export type AssignmentItem = {
  id: string;
  title: string;
  description: string;
  category: "Kinh Thánh" | "Suy ngẫm" | "Cộng đồng" | "Kỹ năng";
  dueDate: string;
  weekNumber?: number | null;
  attachmentUrl?: string | null;
  status: AssignmentStatus;
  grade?: number | null;
};

export type AssignmentQuestion = {
  id: string;
  type: "choice" | "textarea";
  title: string;
  options?: string[];
  placeholder?: string;
};

export const assignmentCategories = [
  "Tất cả",
  "Kinh Thánh",
  "Suy ngẫm",
  "Cộng đồng",
  "Kỹ năng",
] as const;

export const assignmentStatuses = [
  "Tất cả trạng thái",
  "Chưa bắt đầu",
  "Đang thực hiện",
  "Đã nộp",
  "Đã chấm",
  "Trễ hạn",
] as const;

export const fallbackAssignments: AssignmentItem[] = [
  {
    id: "HW-206",
    title: "Tìm hiểu Kinh Thánh - Tuần 4",
    description: "Đọc, ghi chú và suy ngẫm Ma-thi-ơ chương 5.",
    category: "Kinh Thánh",
    dueDate: "2026-06-18",
    weekNumber: 4,
    status: "Đang thực hiện",
  },
  {
    id: "HW-205",
    title: "Nhật ký lòng biết ơn",
    description: "Ghi lại những điều đáng biết ơn trong bảy ngày.",
    category: "Suy ngẫm",
    dueDate: "2026-06-20",
    weekNumber: 5,
    status: "Chưa bắt đầu",
  },
  {
    id: "HW-204",
    title: "Bài thu hoạch Retreat",
    description: "Chia sẻ điều bạn học được sau kỳ tĩnh nguyện.",
    category: "Suy ngẫm",
    dueDate: "2026-06-10",
    weekNumber: 3,
    status: "Đã chấm",
    grade: 9,
  },
  {
    id: "HW-203",
    title: "Thảo luận nhóm nhỏ",
    description: "Chuẩn bị ba câu hỏi cho buổi thảo luận cuối tuần.",
    category: "Cộng đồng",
    dueDate: "2026-06-25",
    weekNumber: 6,
    status: "Đã nộp",
  },
  {
    id: "HW-202",
    title: "Kỹ năng lắng nghe",
    description: "Thực hành lắng nghe chủ động và viết phản hồi.",
    category: "Kỹ năng",
    dueDate: "2026-06-08",
    weekNumber: 2,
    status: "Trễ hạn",
  },
  {
    id: "HW-201",
    title: "Chia sẻ trong cộng đồng",
    description: "Tham gia một hoạt động phục vụ và ghi lại trải nghiệm.",
    category: "Cộng đồng",
    dueDate: "2026-06-30",
    weekNumber: 7,
    status: "Chưa bắt đầu",
  },
];

export function categoryFromWeek(weekNumber?: number | null) {
  const categories: AssignmentItem["category"][] = [
    "Kinh Thánh",
    "Suy ngẫm",
    "Cộng đồng",
    "Kỹ năng",
  ];

  return categories[(weekNumber || 1) % categories.length];
}

export function assignmentRouteId(id: string | number) {
  const raw = String(id);
  return raw.startsWith("HW-") ? raw : `HW-${raw.padStart(3, "0")}`;
}

export function assignmentRawId(id: string) {
  const match = id.match(/\d+/);
  return match ? String(Number(match[0])) : id;
}

export function getAssignmentQuestions(
  assignment: Pick<AssignmentItem, "category" | "title">,
): AssignmentQuestion[] {
  if (assignment.category === "Kinh Thánh") {
    return [
      {
        id: "context",
        type: "choice",
        title: "Bạn đã đọc phân đoạn Kinh Thánh trong tâm thế nào?",
        options: [
          "Tập trung và cầu nguyện",
          "Đọc nhanh để nắm ý",
          "Cần đọc lại lần nữa",
          "Chưa sẵn sàng",
          "Có ghi chú lại",
          "Đã thảo luận với nhóm",
        ],
      },
      {
        id: "main-point",
        type: "choice",
        title: "Điều nào chạm đến bạn nhiều nhất trong bài học này?",
        options: ["Sự khiêm nhường", "Lòng thương xót", "Sự công chính", "Niềm hy vọng"],
      },
      {
        id: "reflection",
        type: "textarea",
        title: "Hãy viết lại một câu hoặc ý chính bạn muốn ghi nhớ.",
        placeholder: "Viết suy ngẫm của bạn tại đây...",
      },
      {
        id: "practice",
        type: "textarea",
        title: "Bạn sẽ áp dụng bài học này trong tuần này như thế nào?",
        placeholder: "Ví dụ: cầu nguyện trước một quyết định, thực hành tha thứ...",
      },
    ];
  }

  if (assignment.category === "Cộng đồng") {
    return [
      {
        id: "participation",
        type: "choice",
        title: "Bạn dự định tham gia hoạt động cộng đồng theo cách nào?",
        options: [
          "Phục vụ trực tiếp",
          "Cầu thay",
          "Mời một người bạn",
          "Hỗ trợ chuẩn bị",
          "Đóng góp tài chính",
          "Chia sẻ thông tin chương trình",
        ],
      },
      {
        id: "attitude",
        type: "choice",
        title: "Thái độ bạn muốn rèn luyện khi phục vụ là gì?",
        options: ["Lắng nghe", "Khiêm nhường", "Kiên nhẫn", "Chủ động"],
      },
      {
        id: "story",
        type: "textarea",
        title: "Mô tả một trải nghiệm cộng đồng khiến bạn được khích lệ.",
        placeholder: "Kể lại một khoảnh khắc, một cuộc trò chuyện hoặc một điều bạn học được...",
      },
      {
        id: "next-step",
        type: "textarea",
        title: "Bước tiếp theo của bạn sau bài tập này là gì?",
        placeholder: "Ví dụ: nhắn tin hỏi thăm một người, đăng ký hỗ trợ nhóm nhỏ...",
      },
    ];
  }

  if (assignment.category === "Kỹ năng") {
    return [
      {
        id: "readiness",
        type: "choice",
        title: "Bạn đánh giá mức độ sẵn sàng thực hành kỹ năng này ra sao?",
        options: [
          "Rất sẵn sàng",
          "Cần thêm hướng dẫn",
          "Hơi ngại bắt đầu",
          "Chưa rõ cách làm",
          "Muốn thực hành cùng người khác",
        ],
      },
      {
        id: "scenario",
        type: "choice",
        title: "Bạn muốn thực hành kỹ năng này trong bối cảnh nào?",
        options: ["Gia đình", "Nhóm nhỏ", "Công việc", "Bạn bè"],
      },
      {
        id: "observation",
        type: "textarea",
        title: "Ghi lại điều bạn nhận ra trong quá trình thực hành.",
        placeholder: "Bạn quan sát được gì về bản thân, người đối diện hoặc hoàn cảnh?",
      },
      {
        id: "improvement",
        type: "textarea",
        title: "Bạn muốn điều chỉnh điều gì cho lần thực hành tiếp theo?",
        placeholder: "Ví dụ: lắng nghe lâu hơn, hỏi câu hỏi rõ hơn, phản hồi chậm lại...",
      },
    ];
  }

  return [
    {
      id: "time",
      type: "choice",
      title: "Bạn đã dành bao nhiêu thời gian cho việc suy ngẫm hôm nay?",
      options: [
        "Dưới 10 phút",
        "10 - 20 phút",
        "20 - 30 phút",
        "Trên 30 phút",
        "Nhiều lần ngắn trong ngày",
      ],
    },
    {
      id: "state",
      type: "choice",
      title: "Trạng thái tâm trí chủ đạo của bạn khi bắt đầu bài tập là gì?",
      options: ["Bồn chồn, lo lắng", "Bình thản và sẵn sàng", "Thiếu tập trung", "Biết ơn và hạnh phúc"],
    },
    {
      id: "moment",
      type: "textarea",
      title: "Hãy mô tả một khoảnh khắc bình yên nhất bạn cảm nhận được.",
      placeholder: "Viết câu trả lời của bạn tại đây...",
    },
    {
      id: "intention",
      type: "textarea",
      title: "Bạn dự định mang sự bình an này vào hoạt động nào trong ngày?",
      placeholder: "Ví dụ: giữ bình tĩnh khi kẹt xe, lắng nghe người khác sâu hơn...",
    },
  ];
}
