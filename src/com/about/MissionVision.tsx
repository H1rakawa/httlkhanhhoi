import { Card, CardContent } from "@heroui/react";
import { ValueIcon } from "@/com/shared/Icons";
import { values } from "@/com/shared/data";
import {
  MotionGroup,
  MotionItem,
  MotionSection,
} from "@/com/shared/MotionSection";

export default function MissionVision() {
  return (
    <MotionSection className="liquid-glass mx-auto w-[calc(100%-2rem)] max-w-7xl p-5 text-[#1d1d1f] md:p-10">
      <div>
        <h2 className="text-center text-2xl font-semibold tracking-normal">
          Sứ mệnh & Tầm nhìn
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-[#6e6e73]">
          Những giá trị cốt lõi dẫn dắt mọi bước đi của chúng tôi trong hành
          trình phụng sự.
        </p>
        <MotionGroup className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((item) => (
            <MotionItem key={item.title}>
              <Card
                variant="transparent"
                className="liquid-glass-item h-full text-center text-[#1d1d1f]"
              >
                <CardContent className="flex flex-col items-center p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/48 text-[#111113] shadow-[0_8px_18px_rgba(31,48,70,0.12)] backdrop-blur-xl">
                    <ValueIcon name={item.icon} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            </MotionItem>
          ))}
        </MotionGroup>
      </div>
    </MotionSection>
  );
}
