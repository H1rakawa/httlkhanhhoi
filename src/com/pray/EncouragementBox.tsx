export default function EncouragementBox() {
  return (
    <form className="flex items-center gap-3 border-t border-[#ececf0] bg-white px-6 py-5">
      <label className="sr-only" htmlFor="encouragement">
        Viết lời động viên
      </label>
      <input
        id="encouragement"
        placeholder="Viết lời động viên..."
        className="h-12 flex-1 rounded-[14px] border border-[#e1e3e8] bg-[#f5f5f7] px-4 text-sm outline-none focus:border-[#6c4cff]"
      />
      <button
        type="submit"
        className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f0ecff] text-xl font-bold text-[#6c4cff]"
        aria-label="Gửi lời động viên"
      >
        ▷
      </button>
    </form>
  );
}
