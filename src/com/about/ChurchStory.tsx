import { MotionSection } from "@/com/shared/MotionSection";
import Image from "next/image";

export default function ChurchStory() {
  return (
    <MotionSection className="liquid-glass mx-auto w-[calc(100%_-_2rem)] max-w-7xl p-5 text-[#1d1d1f] md:p-10">
      <div className="grid gap-10 md:grid-cols-[1.12fr_0.88fr] md:gap-16">
        <div className="liquid-readable min-h-[430px] p-7 md:p-10">
          <p className="text-sm font-medium text-[#6e6e73]">
            Trái tim của Cộng đồng
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal">
            Một ngôi nhà cho mọi thế hệ.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#59616d]">
            <p>
              HTTL. Khánh Hội không chỉ là một ngôi nhà thờ, mà là một gia đình
              nơi mỗi người được đón nhận với sự chân thành và yêu thương.
              Chúng tôi tin rằng đức tin là một hành trình cá nhân nhưng được
              nuôi dưỡng tốt nhất trong một cộng đồng hỗ trợ.
            </p>
            <p>
              Được thành lập trên nền tảng của sự phục vụ và lòng nhân ái,
              chúng tôi nỗ lực tạo ra một không gian nơi mọi thế hệ có thể cùng
              nhau học hỏi, phát triển và lan tỏa những giá trị tốt đẹp đến thế
              giới xung quanh.
            </p>
          </div>
        </div>
        <div className="liquid-readable relative my-8 min-h-[340px] overflow-hidden p-2 md:my-10">
          <Image
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=88"
            alt="Cộng đồng cùng trò chuyện và chia sẻ"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="rounded-[16px] object-cover p-2"
          />
        </div>
      </div>
    </MotionSection>
  );
}
