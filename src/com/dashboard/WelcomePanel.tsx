export default function WelcomePanel() {
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <section className="rounded-[16px] border border-[#e4e4e7] bg-white p-6 md:p-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="dashboard-avatar h-24 w-24 rounded-full border-4 border-white shadow-md" />
            <span className="absolute bottom-2 right-0 h-5 w-5 rounded-full border-2 border-white bg-[#20c66b]" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              Chào mừng trở lại, Thành
            </h1>
            <p className="mt-3 inline-flex rounded-full border border-[#cfe0f7] bg-[#eef5ff] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#0066cc]">
              Thành viên tích cực
            </p>
            <p className="mt-3 text-sm text-[#6e6e73]">
              Tài khoản đã xác minh · Hoạt động tốt
            </p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-[#8a8a8f]">Hôm nay là</p>
          <p className="mt-1 text-lg font-semibold capitalize">{today}</p>
        </div>
      </div>
    </section>
  );
}
