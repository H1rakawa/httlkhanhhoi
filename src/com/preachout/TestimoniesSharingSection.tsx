import Image from "next/image";
import { Testimony } from "@/com/preachout/preachoutData";

type TestimoniesSharingSectionProps = {
  testimonies: Testimony[];
};

export default function TestimoniesSharingSection({
  testimonies,
}: TestimoniesSharingSectionProps) {
  const [featured, ...secondary] = testimonies;

  return (
    <section className="relative z-10 px-5 py-12 md:pb-24">
      <div className="mx-auto max-w-7xl">
        <p className="border-l-4 border-[#3f5cff] pl-5 text-sm font-semibold">
          Góc Chia Sẻ
        </p>
        {!featured ? (
          <div className="liquid-glass mt-8 p-8 text-center text-sm leading-7 text-[#626a75]">
            Chưa có lời làm chứng nào được chia sẻ. Những câu chuyện từ các chuyến
            truyền giảng sẽ xuất hiện tại đây sau khi được ban mục vụ duyệt.
          </div>
        ) : (
        <div
          className={[
            "mt-8 grid gap-7",
            secondary.length ? "lg:grid-cols-[1.45fr_0.7fr]" : "",
          ].join(" ")}
        >
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
                  unoptimized
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

          {secondary.length > 0 && (
          <div className="grid gap-5">
            {secondary.map((item) => (
              <article key={item.id} className="liquid-readable p-6">
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
          )}
        </div>
        )}
      </div>
    </section>
  );
}
