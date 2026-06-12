import Image from "next/image";
import { leaders } from "@/com/shared/data";
import { MotionGroup, MotionItem, MotionSection } from "@/com/shared/MotionSection";

export default function LeadershipTeam() {
  return (
    <MotionSection className="liquid-glass mx-auto w-[calc(100%_-_2rem)] max-w-7xl p-5 text-[#1d1d1f] md:p-10">
      <div>
        <h2 className="text-center text-2xl font-semibold tracking-normal">
          Đội ngũ lãnh đạo
        </h2>
        <MotionGroup className="mt-14 grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          {leaders.map((leader) => (
            <MotionItem
              key={leader.name}
              className="liquid-readable px-5 py-7 text-center"
            >
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-[0_14px_28px_rgba(31,48,70,0.2)]">
                <Image
                  src={leader.photo}
                  alt={leader.name}
                  fill
                  sizes="112px"
                  className="object-cover grayscale transition duration-300 hover:grayscale-0"
                />
              </div>
              <h3 className="mt-5 font-semibold">{leader.name}</h3>
              <p className="mt-1 text-sm text-[#6e6e73]">{leader.role}</p>
            </MotionItem>
          ))}
        </MotionGroup>
      </div>
    </MotionSection>
  );
}
