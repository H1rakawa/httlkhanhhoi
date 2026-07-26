import { adminPrayerStats } from "./adminPrayerData";
import { ClipboardIcon, DocumentIcon, EyeIcon } from "./AdminPrayerIcons";

function StatIcon({ name }: { name: string }) {
  if (name === "clipboard") return <ClipboardIcon className="h-5 w-5" />;
  if (name === "eye") return <EyeIcon className="h-5 w-5" />;
  return <DocumentIcon className="h-5 w-5" />;
}

export default function AdminPrayerStats() {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      {adminPrayerStats.map((stat) => (
        <article
          key={stat.label}
          className="flex min-h-[132px] items-center justify-between rounded-[24px] border border-white/64 bg-white/50 px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_42px_rgba(31,48,70,0.08)] backdrop-blur-xl lg:px-7"
        >
          <div>
            <p className="max-w-[88px] text-xs font-black uppercase leading-4 text-[#7f8796]">
              {stat.label}
            </p>
            <p
              className={[
                "mt-2 text-4xl font-black tracking-normal",
                stat.tone === "gold" ? "text-[#8a6110]" : "text-[#0c1322]",
              ].join(" ")}
            >
              {stat.value}
            </p>
          </div>
          <span
            className={[
              "flex h-[52px] w-[52px] items-center justify-center rounded-full",
              stat.tone === "gold"
                ? "bg-[#ffe7ad]/90 text-[#936813]"
                : "bg-[#dce9ff]/90 text-[#415e8d]",
            ].join(" ")}
          >
            <StatIcon name={stat.icon} />
          </span>
        </article>
      ))}
    </section>
  );
}
