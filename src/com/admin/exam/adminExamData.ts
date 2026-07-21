export type AdminExamStatus = "ongoing" | "upcoming" | "ended" | "draft";

export type AdminExamItem = {
  id: string;
  title: string;
  description: string;
  week: string;
  dueDate: string;
  status: AdminExamStatus;
  participants: number;
  completed: number;
  iconTone: "blue" | "gold" | "dark";
};

export const adminExamStatusLabels: Record<AdminExamStatus, string> = {
  ongoing: "Đang diễn ra",
  upcoming: "Sắp tới",
  ended: "Đã kết thúc",
  draft: "Bản nháp",
};

export const adminExamStatusOptions = [
  { value: "all", label: "Mọi trạng thái" },
  { value: "ongoing", label: adminExamStatusLabels.ongoing },
  { value: "upcoming", label: adminExamStatusLabels.upcoming },
  { value: "ended", label: adminExamStatusLabels.ended },
  { value: "draft", label: adminExamStatusLabels.draft },
] as const;

export const adminExamWeekOptions = [
  { value: "all", label: "Tất cả tuần" },
  { value: "Tuần 01", label: "Tuần 01" },
  { value: "Tuần 02", label: "Tuần 02" },
  { value: "Tuần 03", label: "Tuần 03" },
] as const;

export const adminExamItems: AdminExamItem[] = [
  {
    id: "EX-204",
    title: "Thiền định buổi sáng - Cấp độ 1",
    description: "24 học viên tham gia",
    week: "Tuần 01",
    dueDate: "20/12/2024",
    status: "ongoing",
    participants: 24,
    completed: 18,
    iconTone: "blue",
  },
  {
    id: "EX-203",
    title: "Bài viết về chánh niệm",
    description: "Chưa bắt đầu",
    week: "Tuần 02",
    dueDate: "25/12/2024",
    status: "upcoming",
    participants: 16,
    completed: 0,
    iconTone: "gold",
  },
  {
    id: "EX-202",
    title: "Phân tích hành vi tự thân",
    description: "42 học viên đã hoàn thành",
    week: "Tuần 01",
    dueDate: "15/12/2024",
    status: "ended",
    participants: 42,
    completed: 42,
    iconTone: "dark",
  },
  {
    id: "EX-201",
    title: "Thiền quán tưởng cơ bản",
    description: "18 học viên tham gia",
    week: "Tuần 03",
    dueDate: "30/12/2024",
    status: "ongoing",
    participants: 18,
    completed: 11,
    iconTone: "blue",
  },
];
