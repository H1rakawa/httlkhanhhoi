import Image from "next/image";
import { Testimony } from "@/com/preachout/preachoutData";

type TestimoniesSharingSectionProps = {
  testimonies: Testimony[];
};

export default function TestimoniesSharingSection({
  testimonies,
}: TestimoniesSharingSectionProps) {
  const [featured, ...secondary] = testimonies;

  if (!featured) return null;

  return (
    <section className="relative z-10 px-5 py-12 md:pb-24">
      <div className="mx-auto max-w-7xl">
        <p className="border-l-4 border-[#3f5cff] pl-5 text-sm font-semibold">
          Góc Chia Sẻ
        </p>
        <div className="mt-8 grid gap-7 lg:grid-cols-[1.45fr_0.7fr]">
          <article className="liquid-glass p-8 md:p-10">
            <p className="text-6xl font-bold leading-none text-[#d9d7f7]">“</p>
            <p className="mt-4 text-base italic leading-8 text-[#1d1d1f]">
              {featured.quote}
            </p>
            <div className="mt-8 flex items-center gap-4">
              {featured.image && (
                <Image
                  src={featured.image}
                  alt={featured.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{featured.name}</p>
                {featured.role && (
                  <p className="mt-1 text-sm text-[#626a75]">{featured.role}</p>
                )}
              </div>
            </div>
          </article>

          <div className="grid gap-5">
            {secondary.map((item) => (
              <article key={item.name} className="liquid-readable p-6">
                <p className="text-sm italic leading-7 text-[#626a75]">“{item.quote}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111113] text-xs font-bold text-white">
                    {item.name.charAt(0)}
                  </span>
                  <p className="text-sm font-semibold">{item.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
