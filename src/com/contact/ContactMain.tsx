import ContactForm from "@/com/contact/ContactForm";
import { MotionSection } from "@/com/shared/MotionSection";

export default function ContactMain() {
  return (
    <MotionSection className="liquid-glass mx-auto w-full max-w-7xl p-5 md:p-10">
      <div className="grid gap-6 md:grid-cols-[0.75fr_1.25fr] md:items-stretch">
        <div className="liquid-readable flex flex-col justify-center p-6 md:p-8">
          <p className="text-sm font-medium text-[#0066cc]">Liên hệ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#1d1d1f]">
            Chia sẻ nhu cầu cầu thay, câu hỏi hoặc lời nhắn của bạn.
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#6e6e73]">
            Mỗi lời nhắn đều được đội ngũ tiếp nhận cẩn trọng. Chúng tôi sẽ
            phản hồi qua email hoặc điện thoại tùy theo thông tin bạn để lại.
          </p>
        </div>
        <ContactForm />
      </div>
    </MotionSection>
  );
}
