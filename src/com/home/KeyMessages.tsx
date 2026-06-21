import { Card, CardContent } from "@heroui/react";
import {
  MotionGroup,
  MotionItem,
  MotionSection,
} from "@/com/shared/MotionSection";
import { ValueIcon } from "@/com/shared/Icons";
import { values } from "@/com/shared/data";

export default function KeyMessages() {
  return (
    <MotionSection
      className="liquid-glass mx-auto w-full max-w-7xl px-5 py-10 text-[#1d1d1f] md:px-8 md:py-12"
      id="values"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-normal">
            Những Giá Trị Cốt Lõi
          </h2>
          <p className="mt-2 text-sm text-[#6e6e73]">
            Cộng đồng được xây dựng dựa trên 3 nền tảng
          </p>
        </div>

        <MotionGroup className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
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
