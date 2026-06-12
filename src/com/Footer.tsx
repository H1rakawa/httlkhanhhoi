"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { FacebookIcon, YoutubeIcon } from "@/com/shared/Icons";

const quickLinks = [
  { label: "Về chúng tôi", href: "/about" },
  { label: "Lịch sinh hoạt", href: "/calendar" },
  { label: "Tin tức", href: "/news" },
  { label: "Liên hệ", href: "/contact" },
];

const legalLinks = [
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Điều khoản sử dụng", href: "#" },
];

export default function Footer() {
  const pathname = usePathname();

  const isActiveLink = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <footer className="rounded-t-[28px] bg-black px-5 py-8 text-white shadow-[0_-1px_4px_rgba(0,0,0,0.16)] md:py-10">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.85fr_0.85fr_1fr]">
          <div>
            <p className="text-sm font-semibold">HTTL. Khánh Hội</p>
            <p className="mt-5 max-w-xs text-sm font-medium leading-7 text-white/68">
              Nầy, sự yêu thương của Đức Chúa Trời đã bày tỏ ra trong chúng ta:
              Đức Chúa Trời đã sai Con một Ngài đến thế gian, đặng chúng ta
              nhờ Con được sống.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Liên kết nhanh</p>
            <div className="mt-5 flex flex-col gap-3 text-sm">
              {quickLinks.map((link) => (
                <NextLink
                  key={link.label}
                  href={link.href}
                  aria-current={isActiveLink(link.href) ? "page" : undefined}
                  className={[
                    "w-fit no-underline underline-offset-4 transition-colors hover:text-white hover:underline",
                    isActiveLink(link.href)
                      ? "font-semibold text-white underline"
                      : "text-white/70",
                  ].join(" ")}
                >
                  {link.label}
                </NextLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Pháp lý</p>
            <div className="mt-5 flex flex-col gap-3 text-sm">
              {legalLinks.map((link) => (
                <NextLink
                  key={link.label}
                  href={link.href}
                  className="w-fit text-white/70 no-underline underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {link.label}
                </NextLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Theo dõi</p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white text-black transition-colors hover:border-[#0066cc] hover:bg-[#0066cc] hover:text-white"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white text-black transition-colors hover:border-[#0066cc] hover:bg-[#0066cc] hover:text-white"
                aria-label="Youtube"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <hr className="mt-9 border-white/12" />
        <p className="mt-5 text-center text-sm font-semibold text-white/56">
          © 2026 HTTL. Khánh Hội. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
