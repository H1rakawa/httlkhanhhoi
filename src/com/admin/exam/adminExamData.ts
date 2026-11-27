/** Danh mục bài tập dùng ở trang tạo bài tập; mục đầu tiên là mặc định. */
export const ASSIGNMENT_CATEGORIES = ["Bài học Kinh Thánh hằng tuần"] as const;
export const ASSIGNMENT_DEFAULT_CATEGORY = ASSIGNMENT_CATEGORIES[0];

export type AdminExamStatus = "ongoing" | "upcoming" | "ended" | "draft";

export type AdminExamItem = {
  id: string;
  /** Mã bài tập ban mục vụ nhập (hiển thị cho thành viên và dùng làm đường dẫn). */
  code: string | null;
  title: string;
  description: string;
  week: string;
  weekValue: string;
  dueDate: string;
  status: AdminExamStatus;
  participants: number;
  completed: number;
  iconTone: "blue" | "gold" | "dark";
};

export type AdminExamsResponse = {
  exams: AdminExamItem[];
  page: number;
  pageSize: number;
  total: number;
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
  { value: "week-1", label: "Tuần 01" },
  { value: "week-2", label: "Tuần 02" },
  { value: "week-3", label: "Tuần 03" },
] as const;

