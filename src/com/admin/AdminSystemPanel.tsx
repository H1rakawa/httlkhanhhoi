import Link from "next/link";
import type { AdminProgressItem, AdminTodo } from "@/lib/admin/overview";

export default function AdminSystemPanel({
  todos,
  progress,
}: {
  todos: AdminTodo[];
  progress: AdminProgressItem[];
}) {
  const openTodos = todos.filter((todo) => todo.count === null || todo.count > 0);

  return (
    <aside className="grid content-start gap-6">
      <section className="rounded-[28px] border border-white/72 bg-white/32 p-6 shadow-[0_24px_72px_rgba(31,48,70,0.12)] backdrop-blur-2xl">
        <div className="mb-5 flex items-center gap-3 text-[#39444d]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff2c9] text-[#8a6110]">
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
              <path d="M9 5h10M9 12h10M9 19h10" />
              <path d="m3 5 1.5 1.5L7 4M3 12l1.5 1.5L7 11M3 19l1.5 1.5L7 18" />
            </svg>
          </span>
          <h2 className="text-base font-extrabold">Việc cần xử lý</h2>
        </div>

        {openTodos.length === 0 ? (
          <p className="rounded-[16px] border border-white/54 bg-white/42 p-5 text-sm font-semibold leading-6 text-[#4f5963]">
            Không có việc nào đang chờ. Mọi lời cầu thay, lời nhắn và bài nộp đều đã được xử lý.
          </p>
        ) : (
          <div className="grid gap-4">
            {openTodos.map((todo) => (
              <article
                key={todo.key}
                className="rounded-[16px] border border-white/54 bg-white/42 p-5 text-[#111827]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-extrabold">{todo.title}</h3>
                  <span className="rounded-full bg-[#111827] px-3 py-1 text-sm font-extrabold text-white">
                    {todo.count ?? "?"}
                  </span>
                </div>
                {todo.count === null && (
                  <p className="mt-2 text-sm font-semibold text-[#c43a32]">Không tải được số liệu.</p>
                )}
                <Link
                  href={todo.href}
                  className="mt-4 inline-block text-sm font-extrabold text-[#0066cc] no-underline hover:underline"
                >
                  {todo.action} →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[24px] border border-white/72 bg-white/34 p-6 shadow-[0_20px_54px_rgba(31,48,70,0.1)] backdrop-blur-2xl">
        <h2 className="mb-5 text-base font-extrabold text-[#39444d]">Tiến độ chung</h2>
        <div className="grid gap-5">
          {progress.map((item, index) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-extrabold text-[#252b31]">
                <span>{item.label}</span>
                <span>{item.value === null ? "—" : `${item.value}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#dfe7ee]">
                <div
                  className={[
                    "h-full rounded-full",
                    index % 2 ? "bg-[#6d57ff]" : "bg-[#111614]",
                  ].join(" ")}
                  style={{ width: `${item.value ?? 0}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-[#6f7a84]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
