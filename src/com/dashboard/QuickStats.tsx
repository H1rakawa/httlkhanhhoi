const stats = [
  { label: "Bài tập đã xong", value: "12", color: "border-[#0066cc]" },
  { label: "Điểm trung bình", value: "8.5", color: "border-[#0066cc]" },
  { label: "Thông báo mới", value: "3", color: "border-[#ff7a00]", accent: true },
];

export default function QuickStats() {
  return (
    <section className="grid h-full gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`liquid-glass-item flex h-full flex-col justify-center border-b-[3px] ${stat.color} p-5`}
        >
          <p className="text-sm text-[#8a8a8f]">{stat.label}</p>
          <p
            className={[
              "mt-2 text-3xl font-semibold",
              stat.accent ? "text-[#ff7a00]" : "text-[#1d1d1f]",
            ].join(" ")}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}
