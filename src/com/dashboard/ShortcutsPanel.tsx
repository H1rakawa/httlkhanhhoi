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
    <section className="liquid-readable p-5 md:p-6">
      <h2 className="mb-5 text-lg font-semibold">Truy cập nhanh</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.label}
            href={shortcut.href}
            className={[
              "flex aspect-square min-h-32 flex-col items-center justify-center gap-4 rounded-[16px] border-2 px-2 text-center no-underline shadow-[0_18px_40px_rgba(31,38,48,0.12)]",
              shortcut.primary
                ? "border-[#0066cc] bg-[#0066cc] text-white"
                : "liquid-glass-item border-white/80 text-[#0066cc]",
            ].join(" ")}
          >
            <DashboardIcon
              name={shortcut.icon}
              className="relative z-10 h-7 w-7"
            />
            <span
              className={
                shortcut.primary
                  ? "relative z-10 font-semibold text-white"
                  : "relative z-10 font-semibold text-[#1d1d1f]"
              }
            >
              {shortcut.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[16px] border border-white/80 bg-[linear-gradient(135deg,rgba(0,102,204,0.94),rgba(39,60,168,0.92))] p-8 text-white shadow-[0_18px_36px_rgba(0,102,204,0.22)]">
        <p className="text-xl font-semibold">Vững bước hành trình</p>
        <p className="mt-4 text-sm italic leading-7 text-white/82">
          “Sự kiên trì sẽ dẫn lối bạn đến bến bờ trưởng thành.”
        </p>
      </div>
    </section>
  );
}
