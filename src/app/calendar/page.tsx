import Footer from "@/com/Footer";
import Header from "@/com/Header";
import CalendarBackdrop from "@/com/calendar/CalendarBackdrop";
import CalendarPageClient from "@/com/calendar/CalendarPageClient";

export default function CalendarPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <CalendarBackdrop />
      <Header activePath="/calendar" />
      <section className="relative z-10 flex min-h-[520px] items-center justify-center px-5 pt-14 text-center">
        <div className="liquid-glass mx-auto w-full max-w-7xl px-8 py-12 md:px-16 md:py-16">
          <p className="mx-auto w-fit rounded-full border border-white bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066cc]">
            Lịch sinh hoạt
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold tracking-normal md:text-6xl">
            Gắn Kết Trong
            <span className="block text-[#0066cc]">Ân Điển</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6e6e73]">
            Theo dõi lịch thờ phượng, học Kinh Thánh, thiện nguyện và các buổi
            nhóm của HTTL. Khánh Hội.
          </p>
        </div>
      </section>
      <div className="relative z-10">
        <CalendarPageClient />
        <Footer />
      </div>
    </main>
  );
}
