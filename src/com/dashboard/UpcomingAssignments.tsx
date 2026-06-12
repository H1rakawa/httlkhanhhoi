import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { assignments } from "@/com/dashboard/dashboardData";

export default function UpcomingAssignments() {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bài tập sắp tới</h2>
        <button type="button" className="text-sm font-medium text-[#0066cc] hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <article
            key={assignment.id}
            className={[
              "flex items-center gap-4 rounded-[12px] border border-[#e4e4e7] bg-white p-4",
              assignment.status === "Đã nộp"
                ? "border-l-4 border-l-[#0066cc]"
                : "border-l-4 border-l-[#cfd8e4]",
            ].join(" ")}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f5fb] text-[#0066cc]">
              <DashboardIcon name={assignment.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold">{assignment.title}</h3>
              <p className="mt-1 text-sm text-[#8a8a8f]">{assignment.subtitle}</p>
            </div>
            <span
              className={[
                "shrink-0 rounded-full px-4 py-2 text-xs font-semibold",
                assignment.status === "Đã nộp"
                  ? "bg-[#eef5ff] text-[#0066cc]"
                  : "bg-[#f1f1f4] text-[#6e6e73]",
              ].join(" ")}
            >
              {assignment.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
