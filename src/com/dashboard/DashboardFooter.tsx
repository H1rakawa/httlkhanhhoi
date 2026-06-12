import Link from "next/link";

export default function DashboardFooter() {
  return (
    <footer className="border-t border-[#e4e4e7] bg-[#fafafa] px-5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-semibold">HTTL. Khánh Hội</p>
          <p className="mt-2 text-sm text-[#8a8a8f]">
            © 2026 HTTL. Khánh Hội. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          {[
            ["Chính sách bảo mật", "#"],
            ["Điều khoản sử dụng", "#"],
            ["Trung tâm hỗ trợ", "/contact"],
            ["Liên hệ", "/contact"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-[#6e6e73] underline-offset-4 hover:text-[#1d1d1f] hover:underline"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
