import React from "react";
import { MainLogo } from "@/icons/logo";
import { Button, Link } from "@heroui/react";

const Navbar = () => {
  const navLinks = [
    { link: "/schedule", title: "Lịch sinh hoạt" },
    { link: "/ministries", title: "Mục vụ" },
    { link: "/Contact", title: "Liên hệ" },
    { link: "/about", title: "Về Chúng Tôi" },
  ];

  return (
    <div className="container mx-auto py-5 flex items-center justify-between">
      {/* Logo */}
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 flex justify-center items-center bg-blue-700 rounded-lg">
          <MainLogo />
        </div>

        <span className="font-bold text-blue-700 text-2xl">
          HTTL. Khánh Hội
        </span>
      </div>

      {/* Navbar */}
      <div className="flex gap-8">
        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.link}
              href={l.link}
              className="no-underline hover:underline text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              {l.title}
            </Link>
          ))}

          <Button className="rounded-lg">Đăng nhập</Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
