import { Card, CardContent } from "@heroui/react";
import { timeline } from "@/com/shared/data";
import { MotionGroup, MotionItem, MotionSection } from "@/com/shared/MotionSection";

export default function HistoryTimeline() {
  return (
    <MotionSection className="liquid-glass mx-auto w-[calc(100%_-_2rem)] max-w-7xl p-5 text-[#1d1d1f] md:p-10">
      <div>
        <h2 className="text-center text-2xl font-semibold tracking-normal">
          Hành trình phát triển
        </h2>
        <MotionGroup className="mt-12 space-y-4">
          {timeline.map((item, index) => (
            <MotionItem key={item.year}>
              <Card
                variant="transparent"
                className="liquid-readable text-[#1d1d1f]"
              >
                <CardContent className="grid gap-5 p-7 md:grid-cols-[160px_1fr] md:items-center">
                  <p
                    className={[
                      "text-sm font-semibold",
                      index % 2 === 0 ? "text-[#8a96a3]" : "text-[#758aa2]",
                    ].join(" ")}
                  >
                    {item.year}
                  </p>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p
                      className={[
                        "mt-2 text-sm leading-7",
                        "text-[#6e6e73]",
                      ].join(" ")}
                    >
                      {item.body}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>
          ))}
        </MotionGroup>
      </div>
    </MotionSection>
  );
}
