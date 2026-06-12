import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

const shortcuts = [
  { label: "Nộp bài", href: "#assignments", icon: "upload", primary: true },
  { label: "Thư viện", href: "/news", icon: "book" },
  { label: "Lịch sự kiện", href: "/calendar", icon: "calendar" },
  { label: "Cộng đồng", href: "/contact", icon: "community" },
];

export default function ShortcutsPanel() {
  return (
    <section>
      <h2 className="mb-5 text-lg font-semibold">Truy cập nhanh</h2>
      <div className="grid grid-cols-2 gap-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.label}
            href={shortcut.href}
            className={[
              "flex aspect-square flex-col items-center justify-center gap-5 rounded-[14px] border no-underline transition-transform hover:-translate-y-1",
              shortcut.primary
                ? "border-[#0066cc] bg-[#0066cc] text-white"
                : "border-[#e4e4e7] bg-white text-[#0066cc]",
            ].join(" ")}
          >
            <DashboardIcon name={shortcut.icon} className="h-7 w-7" />
            <span
              className={
                shortcut.primary
                  ? "font-semibold text-white"
                  : "font-semibold text-[#1d1d1f]"
              }
            >
              {shortcut.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[16px] bg-[linear-gradient(135deg,#0066cc,#273ca8)] p-8 text-white">
        <p className="text-xl font-semibold">Vững bước hành trình</p>
        <p className="mt-4 text-sm italic leading-7 text-white/82">
          “Sự kiên trì sẽ dẫn lối bạn đến bến bờ trưởng thành.”
        </p>
      </div>
    </section>
  );
}
