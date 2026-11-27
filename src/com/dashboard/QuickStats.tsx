export default function QuickStats({
  completed,
  average,
  unread,
}: {
  completed: number;
  average: string | null;
  unread: number;
}) {
  const stats = [
    { label: "Bài tập đã xong", value: String(completed), accent: false },
    { label: "Điểm trung bình", value: average ?? "—", accent: false },
    { label: "Thông báo mới", value: String(unread), accent: unread > 0 },
  ];

  return (
    <section className="grid h-full gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`liquid-glass-item flex h-full flex-col justify-center border-b-[3px] p-5 ${
            stat.accent ? "border-[#ff7a00]" : "border-[#0066cc]"
          }`}
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
