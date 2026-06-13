export default function WelcomePanel({
  displayName,
  email,
  avatarUrl,
  status,
}: {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  status: string;
}) {
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());
  const initial =
    email.charAt(0).toUpperCase() || displayName.charAt(0).toUpperCase();

  return (
    <section className="liquid-readable p-6 md:p-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            {avatarUrl ? (
              <div
                className="h-24 w-24 rounded-full border-4 border-white bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#087be8] text-3xl font-bold text-white shadow-md">
                {initial}
              </div>
            )}
            <span className="absolute bottom-2 right-0 h-5 w-5 rounded-full border-2 border-white bg-[#20c66b]" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              Chào mừng trở lại, {displayName}
            </h1>
            <p className="mt-3 inline-flex rounded-full border border-[#cfe0f7] bg-[#eef5ff] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#0066cc]">
              Thành viên tích cực
            </p>
            <p className="mt-3 text-sm text-[#6e6e73]">
              Tài khoản đã xác minh ·{" "}
              {status === "active" ? "Hoạt động tốt" : "Đang tạm ngưng"}
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
