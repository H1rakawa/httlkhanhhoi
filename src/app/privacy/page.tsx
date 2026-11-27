import type { Metadata } from "next";
import Header from "@/com/Header";
import Footer from "@/com/Footer";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Cách Hội Thánh Tin Lành Khánh Hội thu thập, sử dụng và xóa dữ liệu cá nhân của người dùng.",
};

const CONTACT_EMAIL = "hello@httlkhanhhoi.vn";

const sections = [
  {
    title: "Thông tin chúng tôi thu thập",
    items: [
      "Thông tin tài khoản: họ tên, email, số điện thoại và mật khẩu đã được mã hóa khi bạn đăng ký.",
      "Thông tin từ Google hoặc Facebook khi bạn chọn đăng nhập bằng các dịch vụ này: họ tên, email và ảnh đại diện. Chúng tôi không nhận mật khẩu của bạn và không đăng bài thay bạn.",
      "Nội dung bạn chủ động gửi trên website, như lời cầu nguyện, bài nộp và biểu mẫu liên hệ.",
    ],
  },
  {
    title: "Mục đích sử dụng",
    items: [
      "Tạo và duy trì tài khoản, xác thực khi bạn đăng nhập.",
      "Cung cấp các tính năng dành cho thành viên như bài tập, lịch sinh hoạt và thông báo.",
      "Phản hồi các yêu cầu bạn gửi đến Hội Thánh.",
    ],
  },
  {
    title: "Lưu trữ và chia sẻ",
    items: [
      "Dữ liệu được lưu trên hạ tầng của Supabase và website được vận hành trên Vercel.",
      "Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba.",
      "Website dùng cookie để duy trì phiên đăng nhập của bạn.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <SiteParallaxBackdrop />
      <Header activePath="/privacy" />
      <div className="relative z-10">
        <div className="px-4 pb-16 pt-32 md:px-6 md:pb-24 md:pt-40">
          <article className="liquid-glass mx-auto w-full max-w-4xl p-7 md:p-12">
            <p className="text-sm font-medium text-[#0066cc]">
              Cập nhật lần cuối: 05/11/2026
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              Chính sách bảo mật
            </h1>
            <p className="mt-5 text-base leading-7 text-[#515154]">
              Chính sách này mô tả cách Hội Thánh Tin Lành Khánh Hội thu thập,
              sử dụng và bảo vệ dữ liệu cá nhân của bạn khi bạn sử dụng website
              này.
            </p>

            {sections.map((section) => (
              <section key={section.title} className="mt-10">
                <h2 className="text-2xl font-semibold tracking-normal">
                  {section.title}
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-[#515154]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}

            <section id="xoa-du-lieu" className="mt-10 scroll-mt-32">
              <h2 className="text-2xl font-semibold tracking-normal">
                Yêu cầu xóa dữ liệu
              </h2>
              <p className="mt-4 text-base leading-7 text-[#515154]">
                Bạn có thể yêu cầu xóa tài khoản và dữ liệu cá nhân của mình bất
                cứ lúc nào, kể cả khi bạn đăng nhập bằng Google hoặc Facebook:
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-7 text-[#515154]">
                <li>
                  Gửi email đến{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-medium text-[#0066cc]"
                  >
                    {CONTACT_EMAIL}
                  </a>{" "}
                  với tiêu đề &quot;Yêu cầu xóa dữ liệu&quot;.
                </li>
                <li>Ghi rõ email hoặc tên tài khoản bạn dùng để đăng nhập.</li>
                <li>
                  Chúng tôi sẽ xác minh yêu cầu, xóa tài khoản cùng dữ liệu liên
                  quan và phản hồi cho bạn khi hoàn tất.
                </li>
              </ol>
              <p className="mt-4 text-base leading-7 text-[#515154]">
                Nếu dùng Facebook, bạn cũng có thể gỡ quyền truy cập của ứng dụng
                trong Cài đặt Facebook, mục Ứng dụng và trang web.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-semibold tracking-normal">Liên hệ</h2>
              <p className="mt-4 text-base leading-7 text-[#515154]">
                Hội Thánh Tin Lành Khánh Hội, 98 Lê Quốc Hưng, Quận 4, TP. Hồ Chí
                Minh. Email: {CONTACT_EMAIL}.
              </p>
            </section>
          </article>
        </div>
        <Footer />
      </div>
    </main>
  );
}
