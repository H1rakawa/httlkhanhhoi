import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { categoryLabel, type LibraryResource } from "@/com/library/libraryData";

export default function SuggestedResources({ resources }: { resources: LibraryResource[] }) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-normal text-[#25262b]">Tài liệu mới</h2>
        <Link
          href="/library"
          className="shrink-0 text-sm font-semibold text-[#0066cc] hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {resources.length === 0 ? (
        <p className="liquid-glass-item border-white/80 p-5 text-sm leading-6 text-[#6e6e73]">
          Thư viện chưa có tài liệu mới.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={`/library/${resource.id}`}
              className="liquid-glass-item grid min-h-[154px] content-start gap-4 border-white/80 p-5 text-[#1d1d1f] no-underline transition-transform hover:-translate-y-0.5"
            >
              <div className="flex gap-4">
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] border border-[#d8e8ff] bg-[#eef6ff] text-[#0066cc] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
                  <DashboardIcon
                    name={resource.type === "Video" ? "video" : "book"}
                    className="h-6 w-6"
                  />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-lg font-semibold leading-6">
                    {resource.title}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-[#6e6e73]">
                    {[
                      resource.source === "youtube" ? "Bài giảng video" : resource.type,
                      categoryLabel(resource.category),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </div>
              {resource.description && (
                <p className="line-clamp-3 text-sm leading-7 text-[#6e6e73]">
                  {resource.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
