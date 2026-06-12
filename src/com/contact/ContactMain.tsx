import ContactForm from "@/com/contact/ContactForm";
import { MotionSection } from "@/com/shared/MotionSection";

export default function ContactMain() {
  return (
    <MotionSection className="bg-[#f5f5f7] px-5 py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-start">
        <div className="pt-2">
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
