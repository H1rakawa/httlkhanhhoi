import { adminAlerts, adminProgress } from "@/com/admin/adminData";

const alertClassName: Record<string, string> = {
  red: "border-[#d84b40]/18 bg-[#f4e4da]/64 text-[#c43a32]",
  dark: "border-white/54 bg-white/42 text-[#111827]",
};

export default function AdminSystemPanel() {
  return (
    <aside className="grid content-start gap-6">
      <section className="rounded-[28px] border border-white/72 bg-white/32 p-6 shadow-[0_24px_72px_rgba(31,48,70,0.12)] backdrop-blur-2xl">
        <div className="mb-5 flex items-center gap-3 text-[#39444d]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f9e3df] text-[#d9463e]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 4 21 20H3z" />
              <path d="M12 9v5M12 17h.01" />
            </svg>
          </span>
          <h2 className="text-base font-extrabold">Cảnh báo hệ thống</h2>
        </div>

        <div className="grid gap-4">
          {adminAlerts.map((alert) => (
            <article
              key={alert.title}
              className={[
                "rounded-[16px] border p-5",
                alertClassName[alert.tone],
              ].join(" ")}
            >
              <h3 className="font-extrabold">{alert.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#4f5963]">
                {alert.body}
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-extrabold text-current"
              >
                {alert.action}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/72 bg-white/34 p-6 shadow-[0_20px_54px_rgba(31,48,70,0.1)] backdrop-blur-2xl">
        <h2 className="mb-5 text-base font-extrabold text-[#39444d]">
          Tiến độ chung
        </h2>
        <div className="grid gap-5">
          {adminProgress.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm font-extrabold text-[#252b31]">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#dfe7ee]">
                <div
                  className={[
                    "h-full rounded-full",
                    item.tone === "blue" ? "bg-[#6d57ff]" : "bg-[#111614]",
                  ].join(" ")}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
