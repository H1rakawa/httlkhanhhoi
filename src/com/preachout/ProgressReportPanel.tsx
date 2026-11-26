import type { ProgressStat } from "@/com/preachout/preachoutData";

type ProgressReportPanelProps = {
  stats: ProgressStat[];
};

export default function ProgressReportPanel({ stats }: ProgressReportPanelProps) {
  return (
    <section className="relative z-10 px-5 py-8">
      <div className="liquid-glass mx-auto max-w-7xl p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0066cc]">
              Báo cáo nhanh
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">
              Tiến độ truyền giảng
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#626a75]">
            Số liệu cập nhật trực tiếp từ hệ thống: số hoạt động, lượt đăng ký
            tham gia và tài liệu đang được chia sẻ.
          </p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.label} className="liquid-readable p-5">
              <p className="text-sm font-semibold text-[#626a75]">{stat.label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-2 text-xs font-semibold text-[#0066cc]">{stat.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
