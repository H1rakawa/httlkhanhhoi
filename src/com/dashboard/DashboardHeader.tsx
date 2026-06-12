"use client";

import { Dropdown } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Cộng đồng", href: "/contact" },
  { label: "Thư viện", href: "/news" },
  { label: "Sự kiện", href: "/calendar" },
];

export default function DashboardHeader() {
  const router = useRouter();

  const handleMenuAction = (key: React.Key) => {
    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      assignments: "/dashboard#assignments",
      library: "/news",
      events: "/calendar",
      logout: "/auth",
    };

    const destination = routes[String(key)];
    if (destination) router.push(destination);
  };

  return (
    <header className="border-b border-[#e4e4e7] bg-white px-5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6">
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/logo.png"
            alt="HTTL. Khánh Hội"
            width={355}
            height={101}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden h-full items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "flex h-full items-center border-b-2 text-sm font-medium no-underline transition-colors",
                link.href === "/dashboard"
                  ? "border-[#0066cc] text-[#0066cc]"
                  : "border-transparent text-[#6e6e73] hover:text-[#1d1d1f]",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-[#6e6e73]">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f5f5f7]"
            aria-label="Thông báo"
          >
            <DashboardIcon name="bell" className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-[#f5f5f7] sm:flex"
            aria-label="Cài đặt"
          >
            <DashboardIcon name="settings" className="h-5 w-5" />
          </button>
          <Dropdown>
            <Dropdown.Trigger
              aria-label="Mở menu tài khoản"
              className="h-10 w-10 rounded-full bg-transparent p-0 outline-none ring-offset-2 transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#0066cc]"
            >
              <span className="dashboard-avatar block h-10 w-10 rounded-full border-2 border-white shadow-sm" />
            </Dropdown.Trigger>
            <Dropdown.Popover
              placement="bottom end"
              className="min-w-56 rounded-[12px] border border-[#e4e4e7] bg-white p-2 shadow-[0_14px_36px_rgba(0,0,0,0.16)]"
            >
              <Dropdown.Menu
                aria-label="Menu tài khoản"
                onAction={handleMenuAction}
                className="outline-none"
              >
                <Dropdown.Item
                  id="dashboard"
                  className="cursor-pointer rounded-[8px] px-4 py-3 text-sm font-semibold text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus:bg-[#f5f5f7]"
                >
                  Bảng điều khiển
                </Dropdown.Item>
                <Dropdown.Item
                  id="assignments"
                  className="cursor-pointer rounded-[8px] px-4 py-3 text-sm font-semibold text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus:bg-[#f5f5f7]"
                >
                  Danh sách bài tập
                </Dropdown.Item>
                <Dropdown.Item
                  id="library"
                  className="cursor-pointer rounded-[8px] px-4 py-3 text-sm font-semibold text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus:bg-[#f5f5f7]"
                >
                  Thư viện tài liệu
                </Dropdown.Item>
                <Dropdown.Item
                  id="events"
                  className="cursor-pointer rounded-[8px] px-4 py-3 text-sm font-semibold text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus:bg-[#f5f5f7]"
                >
                  Lịch sự kiện
                </Dropdown.Item>
                <Dropdown.Item
                  id="logout"
                  className="mt-2 cursor-pointer border-t border-[#ececee] px-4 pb-3 pt-4 text-sm font-semibold text-[#8a8a8f] outline-none hover:bg-[#f5f5f7] hover:text-[#1d1d1f] focus:bg-[#f5f5f7]"
                >
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
