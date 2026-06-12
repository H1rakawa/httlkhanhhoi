import { Card, CardContent } from "@heroui/react";
import {
  ClockIcon,
  FacebookIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  YoutubeIcon,
} from "@/com/shared/Icons";
import { MotionItem, MotionSection } from "@/com/shared/MotionSection";

const contactItems = [
  {
    icon: PinIcon,
    title: "Địa chỉ",
    body: "123 Đường Hòa Bình, Quận 1, TP. Hồ Chí Minh",
  },
  {
    icon: PhoneIcon,
    title: "Số điện thoại",
    body: "+84 (28) 1234 5678",
  },
  {
    icon: MailIcon,
    title: "Email",
    body: "hello@httlkhanhhoi.vn",
  },
  {
    icon: ClockIcon,
    title: "Giờ làm việc",
    body: "Thứ Hai - Thứ Sáu, 08:30 - 17:30",
  },
];

export default function ContactInfo() {
  return (
    <MotionSection className="bg-white px-5 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#0066cc]">
              Thông tin liên lạc nhanh
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#1d1d1f]">
              Kết nối theo cách thuận tiện nhất
            </h2>
          </div>
          <div className="flex gap-3">
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0099ff] text-white transition-colors hover:bg-[#0077cc]"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0099ff] text-white transition-colors hover:bg-[#0077cc]"
              aria-label="Youtube"
            >
              <YoutubeIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-4">
          {contactItems.map((item) => {
            const Icon = item.icon;

            return (
              <MotionItem key={item.title}>
                <Card className="h-full rounded-[16px] border border-[#ececee] bg-[#f5f5f7] shadow-none">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0099ff]/12 text-[#0077cc]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-[#1d1d1f]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#6e6e73]">
                      {item.body}
                    </p>
                  </CardContent>
                </Card>
              </MotionItem>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
