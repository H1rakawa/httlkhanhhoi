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
