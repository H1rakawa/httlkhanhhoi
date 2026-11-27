import Link from "next/link";
import {
  formatDueDate,
  vietnamDateKey,
  type AssignmentItem,
} from "@/com/assignment/assignmentData";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

function dueText(dueDate: string | null) {
  if (!dueDate) return "Chưa có hạn hoàn thành";
  if (dueDate === vietnamDateKey()) return "Hạn hôm nay";
  if (dueDate === vietnamDateKey(1)) return "Hạn ngày mai";
  const days = Math.round(
    (new Date(`${dueDate}T00:00:00Z`).getTime() -
      new Date(`${vietnamDateKey()}T00:00:00Z`).getTime()) /
      86400000,
  );
  return `Còn ${days} ngày · ${formatDueDate(dueDate)}`;
}

function iconFor(assignment: AssignmentItem): "book" | "document" | "group" {
  const source = `${assignment.category} ${assignment.title}`.toLowerCase();
  if (source.includes("nhóm") || source.includes("cộng đồng")) return "group";
  if (source.includes("kinh thánh") || source.includes("thánh học")) return "book";
  return "document";
}

export default function UpcomingAssignments({
  assignments,
  error,
}: {
  assignments: AssignmentItem[];
  error: string | null;
}) {
  const done = (assignment: AssignmentItem) =>
    assignment.status === "Đã nộp" || assignment.status === "Đã chấm";

  return (
    <section className="liquid-readable flex h-full flex-col p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bài tập sắp tới</h2>
        <Link href="/assignment" className="text-sm font-medium text-[#0066cc] hover:underline">
          Xem tất cả
        </Link>
      </div>

      {error ? (
        <div className="liquid-glass-item flex flex-1 flex-col justify-center border-2 border-white/80 p-5 text-center">
          <p className="text-base font-semibold">Chưa tải được bài tập</p>
          <p className="mt-2 text-sm leading-6 text-[#6e6e73]">{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="liquid-glass-item flex flex-1 flex-col justify-center border-2 border-white/80 p-5 text-center">
          <p className="text-base font-semibold">Không có bài tập sắp hết hạn</p>
          <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
            Hiện chưa có bài tập nào kết thúc trong 7 ngày tới.
          </p>
        </div>
      ) : (
        <div className="grid flex-1 content-start gap-4">
          {assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/assignment/${assignment.id}`}
              className={[
                "liquid-glass-item flex flex-col items-start gap-4 border-2 border-l-4 border-white/80 p-4 text-[#1d1d1f] no-underline sm:flex-row sm:items-center",
                done(assignment) ? "border-l-[#0066cc]" : "border-l-[#cfd8e4]",
              ].join(" ")}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f5fb] text-[#0066cc]">
                <DashboardIcon name={iconFor(assignment)} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold">{assignment.title}</h3>
                <p className="mt-1 text-sm text-[#8a8a8f]">
                  Hạn hoàn thành: {dueText(assignment.dueDate)}
                </p>
              </div>
              <span
                className={[
                  "shrink-0 self-start rounded-full px-4 py-2 text-xs font-semibold sm:self-auto",
                  done(assignment) ? "bg-[#eef5ff] text-[#0066cc]" : "bg-[#f1f1f4] text-[#6e6e73]",
                ].join(" ")}
              >
                {assignment.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
