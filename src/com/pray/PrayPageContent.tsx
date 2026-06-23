"use client";

import { useEffect, useState } from "react";
import PrayerRequestDetail from "@/com/pray/PrayerRequestDetail";
import PrayerRequestForm from "@/com/pray/PrayerRequestForm";
import PrayerRequestList from "@/com/pray/PrayerRequestList";
import { PrayerRequest, prayerRequests } from "@/com/pray/prayData";

export default function PrayPageContent() {
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  useEffect(() => {
    if (!selectedRequest) return;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedRequest(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedRequest]);

  return (
    <>
      <section className="relative z-10 px-5 pb-12 pt-28 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6c4cff]">
            Cầu Thay & Đồng Hành
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            Nơi tình thương được lan tỏa qua lời cầu nguyện
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#626a75]">
            Hãy để cộng đồng cùng bạn đi qua những thử thách, nâng đỡ nhau bằng
            lời cầu thay, sự lắng nghe và những lời động viên chân thành.
          </p>
        </div>
      </section>

      <section className="relative z-10 px-5 pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PrayerRequestForm />
          </div>
          <PrayerRequestList requests={prayerRequests} onOpen={setSelectedRequest} />
        </div>
      </section>

      <PrayerRequestDetail
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}
