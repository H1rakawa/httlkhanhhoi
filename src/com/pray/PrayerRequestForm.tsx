export default function PrayerRequestForm() {
  return (
    <section className="liquid-glass p-7 md:p-8">
      <h2 className="text-xl font-semibold">Gửi Lời Cầu Thay</h2>
      <form className="mt-8 grid gap-6">
        <label className="grid gap-3">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#7b7480]">
            Tiêu đề
          </span>
          <input
            type="text"
            placeholder="Tên của ý nguyện..."
            className="h-14 rounded-[12px] border border-white/90 bg-white/64 px-5 text-sm outline-none placeholder:text-[#8a929c] focus:border-[#6c4cff]"
          />
        </label>
        <label className="grid gap-3">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#7b7480]">
            Nội dung
          </span>
          <textarea
            rows={6}
            placeholder="Chia sẻ tâm tư của bạn..."
            className="resize-none rounded-[12px] border border-white/90 bg-white/64 p-5 text-sm leading-7 outline-none placeholder:text-[#8a929c] focus:border-[#6c4cff]"
          />
        </label>
        <label className="grid gap-3">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#7b7480]">
            Đính kèm
          </span>
          <input
            type="file"
            className="rounded-[12px] border border-dashed border-white/90 bg-white/46 px-4 py-3 text-sm text-[#626a75] file:mr-4 file:rounded-full file:border-0 file:bg-[#f0ecff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#6c4cff]"
          />
        </label>
        <div className="flex items-center justify-between rounded-[14px] border border-white/75 bg-white/46 px-4 py-3">
          <span className="text-sm font-medium">Quyền riêng tư: Công khai</span>
          <button
            type="button"
            className="relative h-8 w-14 rounded-full bg-[#6c4cff] shadow-inner"
            aria-label="Chuyển quyền riêng tư"
          >
            <span className="absolute right-1 top-1 h-6 w-6 rounded-full bg-white shadow" />
          </button>
        </div>
        <button
          type="submit"
          className="h-14 rounded-full bg-[#111113] text-sm font-bold text-white shadow-[0_16px_30px_rgba(0,0,0,0.18)]"
        >
          Gửi lời cầu thay ▷
        </button>
      </form>
    </section>
  );
}
