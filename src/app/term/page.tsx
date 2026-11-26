import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/com/Header";
import Footer from "@/com/Footer";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | HTTL. Khánh Hội",
  description:
    "Các điều khoản khi sử dụng website, tài khoản thành viên và các tính năng của Hội Thánh Tin Lành Khánh Hội.",
};

const CONTACT_EMAIL = "hello@httlkhanhhoi.vn";

const sections = [
  {
    id: "chap-nhan",
    title: "1. Chấp nhận điều khoản",
    items: [
      "Khi truy cập hoặc sử dụng website của Hội Thánh Tin Lành Khánh Hội, bạn đồng ý tuân theo các điều khoản này và Chính sách bảo mật.",
      "Nếu không đồng ý với bất kỳ nội dung nào, vui lòng ngừng sử dụng website.",
      "Người dưới 16 tuổi nên sử dụng tài khoản và các tính năng gửi nội dung khi có sự đồng ý của cha mẹ hoặc người giám hộ.",
    ],
  },
  {
    id: "tai-khoan",
    title: "2. Tài khoản thành viên",
    items: [
      "Bạn có thể đăng ký bằng email và mật khẩu, hoặc đăng nhập bằng Google hay Facebook. Thông tin cung cấp cần chính xác và là của chính bạn.",
      "Bạn chịu trách nhiệm giữ bí mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình. Hãy báo ngay cho chúng tôi nếu nghi ngờ tài khoản bị truy cập trái phép.",
      "Vai trò của tài khoản (thành viên, giáo viên, quản trị viên) do Hội Thánh cấp. Bạn không được tìm cách tự nâng quyền hoặc truy cập khu vực không dành cho mình.",
      "Hội Thánh có thể tạm khoá tài khoản vi phạm các điều khoản này. Bạn có thể yêu cầu xoá tài khoản bất cứ lúc nào theo hướng dẫn trong Chính sách bảo mật.",
    ],
  },
  {
    id: "tinh-nang",
    title: "3. Sử dụng các tính năng",
    items: [
      "Lịch sinh hoạt và truyền giảng: khi đăng ký tham gia, bạn cung cấp thông tin liên lạc để ban tổ chức sắp xếp. Số chỗ có hạn, việc đăng ký có thể đóng khi đủ người hoặc khi sự kiện thay đổi. Vui lòng huỷ đăng ký nếu bạn không thể tham dự.",
      "Bài tập: bài nộp phải là bài làm của chính bạn. Điểm và nhận xét do giáo viên đưa ra; mọi hành vi can thiệp vào điểm hoặc xem đáp án trái phép đều bị xem là vi phạm.",
      "Cầu thay: lời cầu nguyện được chia sẻ theo chế độ bạn chọn (công khai hoặc riêng tư). Xin cân nhắc trước khi nêu thông tin nhạy cảm của người khác.",
      "Làm chứng: lời làm chứng bạn gửi sẽ được ban mục vụ xem xét trước khi hiển thị công khai và có thể được biên tập ngắn gọn.",
      "Biểu mẫu liên hệ: chỉ dùng để gửi câu hỏi, góp ý hoặc nhu cầu thật đến Hội Thánh, không dùng để quảng cáo hay gửi thư rác.",
    ],
  },
  {
    id: "noi-dung-nguoi-dung",
    title: "4. Nội dung do bạn gửi",
    items: [
      "Bạn giữ quyền đối với nội dung mình gửi, và cho phép Hội Thánh lưu trữ, hiển thị và sử dụng nội dung đó trong phạm vi các hoạt động mục vụ trên website.",
      "Không đăng nội dung trái pháp luật, xúc phạm, kích động thù ghét, lừa đảo, vi phạm bản quyền hoặc tiết lộ thông tin cá nhân của người khác khi chưa được đồng ý.",
      "Hội Thánh có quyền ẩn, chỉnh sửa hoặc xoá nội dung vi phạm mà không cần báo trước.",
    ],
  },
  {
    id: "ban-quyen",
    title: "5. Tài liệu và bản quyền",
    items: [
      "Bài giảng, tài liệu trong thư viện, hình ảnh và bài viết trên website thuộc Hội Thánh hoặc được sử dụng với sự cho phép của tác giả.",
      "Bạn được xem, tải về và chia sẻ tài liệu cho mục đích học tập, thờ phượng và truyền giảng phi thương mại, kèm ghi nguồn HTTL. Khánh Hội.",
      "Không được bán, chỉnh sửa rồi phát hành lại, hoặc dùng tài liệu cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.",
      "Video bài giảng được nhúng từ YouTube và tuân theo điều khoản của YouTube.",
    ],
  },
  {
    id: "hanh-vi-cam",
    title: "6. Hành vi bị cấm",
    items: [
      "Truy cập trái phép, dò quét lỗ hổng, can thiệp vào hệ thống hoặc dữ liệu của website và người dùng khác.",
      "Dùng công cụ tự động để gửi biểu mẫu, đăng ký sự kiện hàng loạt hoặc thu thập dữ liệu.",
      "Mạo danh Hội Thánh, ban mục vụ hoặc thành viên khác.",
    ],
  },
  {
    id: "trach-nhiem",
    title: "7. Giới hạn trách nhiệm",
    items: [
      "Website được cung cấp theo hiện trạng. Chúng tôi cố gắng giữ thông tin chính xác, nhưng lịch sinh hoạt và sự kiện có thể thay đổi; thông báo chính thức của Hội Thánh luôn được ưu tiên.",
      "Website có thể tạm gián đoạn để bảo trì hoặc do sự cố từ nhà cung cấp hạ tầng (Supabase, Vercel, YouTube, Google, Facebook).",
      "Chúng tôi không chịu trách nhiệm về nội dung của các website bên ngoài được liên kết đến.",
    ],
  },
  {
    id: "thay-doi",
    title: "8. Thay đổi điều khoản",
    items: [
      "Điều khoản có thể được cập nhật khi website có tính năng mới. Ngày cập nhật được ghi ở đầu trang.",
      "Việc bạn tiếp tục sử dụng website sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận phiên bản mới.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <SiteParallaxBackdrop />
      <Header activePath="/term" />
      <div className="relative z-10">
        <div className="px-4 pb-16 pt-32 md:px-6 md:pb-24 md:pt-40">
          <article className="liquid-glass mx-auto w-full max-w-4xl p-7 md:p-12">
            <p className="text-sm font-medium text-[#0066cc]">
              Cập nhật lần cuối: 26/11/2026
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              Điều khoản sử dụng
            </h1>
            <p className="mt-5 text-base leading-7 text-[#515154]">
              Các điều khoản dưới đây áp dụng cho mọi người truy cập website của
              Hội Thánh Tin Lành Khánh Hội, gồm khách xem trang, thành viên đã
              đăng nhập và ban mục vụ. Cách chúng tôi xử lý dữ liệu cá nhân được
              mô tả trong{" "}
              <Link href="/privacy" className="font-medium text-[#0066cc]">
                Chính sách bảo mật
              </Link>
              .
            </p>

            <nav
              aria-label="Mục lục"
              className="liquid-readable mt-8 p-5 text-sm leading-7"
            >
              <p className="font-semibold">Mục lục</p>
              <ol className="mt-2 grid gap-x-6 sm:grid-cols-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-[#0066cc] no-underline hover:underline"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#lien-he"
                    className="text-[#0066cc] no-underline hover:underline"
                  >
                    9. Liên hệ
                  </a>
                </li>
              </ol>
            </nav>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mt-10 scroll-mt-32">
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

            <section id="lien-he" className="mt-10 scroll-mt-32">
              <h2 className="text-2xl font-semibold tracking-normal">9. Liên hệ</h2>
              <p className="mt-4 text-base leading-7 text-[#515154]">
                Mọi câu hỏi về điều khoản, xin gửi qua{" "}
                <Link href="/contact" className="font-medium text-[#0066cc]">
                  trang Liên hệ
                </Link>{" "}
                hoặc email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-[#0066cc]"
                >
                  {CONTACT_EMAIL}
                </a>
                . Hội Thánh Tin Lành Khánh Hội, 98 Lê Quốc Hưng, Quận 4, TP. Hồ Chí
                Minh.
              </p>
            </section>
          </article>
        </div>
        <Footer />
      </div>
    </main>
  );
}
