/** Hiện trong lúc trang render ở server đang chờ dữ liệu Supabase. */
export default function PageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f4f8]" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#d7deea] border-t-[#0066cc]" />
        <p className="text-sm font-extrabold text-[#526174]">Đang tải…</p>
      </div>
    </main>
  );
}
