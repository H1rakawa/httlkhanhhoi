import Footer from "@/com/Footer";
import Header from "@/com/Header";
import CalendarPageClient from "@/com/calendar/CalendarPageClient";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      <Header activePath="/calendar" />
      <section className="relative isolate flex min-h-[520px] items-center justify-center overflow-hidden bg-white px-5 pt-14 text-center">
        <div className="calendar-hero-image absolute inset-0 opacity-58" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.72)_68%,#fff_100%)]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-sm font-medium text-[#424245]">Lịch Sinh Hoạt</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-normal md:text-6xl">
            Kết nối qua từng hoạt động ý nghĩa.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6e6e73]">
            Theo dõi lịch thờ phượng, học Kinh Thánh, thiện nguyện và các buổi
            nhóm của HTTL. Khánh Hội.
          </p>
        </div>
      </section>
      <CalendarPageClient />
      <Footer />
    </main>
  );
}
