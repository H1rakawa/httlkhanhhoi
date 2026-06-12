import { Card, CardContent } from "@heroui/react";
import Image from "next/image";
import { MailIcon, PhoneIcon, PinIcon } from "@/com/shared/Icons";
import { MotionSection } from "@/com/shared/MotionSection";

export default function QuickContact() {
  return (
    <MotionSection className="liquid-glass mx-auto w-[calc(100%_-_2rem)] max-w-7xl p-5 text-[#1d1d1f] md:p-10">
      <div>
        <Card
          className="liquid-readable text-[#1d1d1f]"
        >
          <CardContent className="grid gap-10 p-8 md:grid-cols-[0.9fr_1fr] md:p-12">
            <div>
              <p className="text-sm font-medium text-[#6e6e73]">
                Kết nối với chúng tôi
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal">
                Chúng tôi luôn sẵn lòng lắng nghe và đồng hành cùng bạn.
              </h2>
              <div className="mt-7 space-y-4 text-sm text-[#424245]">
                <p className="flex items-center gap-3">
                  <PinIcon className="h-4 w-4 text-[#0066cc]" />
                  123 Đường Hòa Bình, Quận 1, TP. Hồ Chí Minh
                </p>
                <p className="flex items-center gap-3">
                  <PhoneIcon className="h-4 w-4 text-[#0066cc]" />
                  +84 (28) 1234 5678
                </p>
                <p className="flex items-center gap-3">
                  <MailIcon className="h-4 w-4 text-[#0066cc]" />
                  hello@httlkhanhhoi.vn
                </p>
              </div>
            </div>
            <div className="relative min-h-72 overflow-hidden rounded-[16px] border border-white/90 shadow-[0_16px_34px_rgba(31,48,70,0.18)]">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=85"
                alt="Bản đồ thành phố"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[rgba(0,102,204,0.08)]" />
              <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#ffb000] shadow-[0_0_0_8px_rgba(255,176,0,0.22)]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </MotionSection>
  );
}
