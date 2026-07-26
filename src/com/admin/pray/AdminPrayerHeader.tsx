export default function AdminPrayerHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7d8798]">
          <span>Quản trị</span>
          <span>/</span>
          <span className="text-[#101828]">Lời cầu thay</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-[#0f172a] md:text-3xl">
          Quản lý Lời cầu thay
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#506070]">
          Quản lý và theo dõi các lời cầu thay của cộng đồng.
        </p>
      </div>
    </header>
  );
}
