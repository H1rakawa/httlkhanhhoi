import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import LibraryBackdrop from "@/com/library/LibraryBackdrop";
import LibraryDetailActions from "@/com/library/LibraryDetailActions";
import { LibraryResourceArtwork } from "@/com/library/LibraryResourceCard";
import LibraryResourcePreview from "@/com/library/LibraryResourcePreview";
import { categoryLabel, previewKind } from "@/com/library/libraryData";
import { getLibraryResourceById, getRelatedResources } from "@/lib/library/resources";

type LibraryDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
}

export async function generateMetadata({ params }: LibraryDetailPageProps): Promise<Metadata> {
  const resource = await getLibraryResourceById((await params).id);
  if (!resource) return { title: "Không tìm thấy tài liệu" };
  return {
    title: `${resource.title} · Thư viện`,
    description: resource.description || undefined,
  };
}

export default async function LibraryDetailPage({ params }: LibraryDetailPageProps) {
  const { id } = await params;
  const resource = await getLibraryResourceById(id);
  if (!resource) notFound();

  const related = await getRelatedResources(resource);
  const category = categoryLabel(resource.category);
  const canPreview = Boolean(previewKind(resource));
  const facts = [
    ["Định dạng", resource.type],
    ["Danh mục", category || "Chung"],
    ["Dung lượng", resource.sizeLabel],
    ["Kiểu file", resource.mimeType],
    ["Ngày đăng", formatDate(resource.createdAt)],
    [
      "Cập nhật",
      resource.updatedAt && resource.updatedAt !== resource.createdAt
        ? formatDate(resource.updatedAt)
        : null,
    ],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <LibraryBackdrop />
      <Header activePath="/library" />

      <div className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl pb-20 pt-24 md:pb-28 md:pt-28">
        <nav className="liquid-readable flex w-fit items-center gap-2 px-4 py-3 text-sm">
          <Link href="/library" className="font-semibold text-[#0066cc] no-underline">
            Thư viện
          </Link>
          <span className="text-[#8a929c]">›</span>
          <span className="max-w-[58vw] truncate font-medium">{resource.title}</span>
        </nav>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
          <div className="space-y-6">
            <section className="liquid-glass p-4 sm:p-6">
              {canPreview ? (
                <LibraryResourcePreview resource={resource} className="rounded-[20px]" />
              ) : (
                <div className="group relative aspect-[16/10] overflow-hidden rounded-[20px] shadow-[0_28px_70px_rgba(7,17,31,0.24)]">
                  <LibraryResourceArtwork resource={resource} sizes="900px" />
                  {category && (
                    <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-[#87620c]/88 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
                      {category}
                    </span>
                  )}
                </div>
              )}
            </section>

            <article className="liquid-glass p-6 sm:p-9 md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">
                {[resource.type, category].filter(Boolean).join(" · ")}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                {resource.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#626a75]">
                <span className="liquid-readable px-4 py-2">HTTL. Khánh Hội</span>
                <span className="liquid-readable px-4 py-2">{formatDate(resource.createdAt)}</span>
                {resource.source === "youtube" && (
                  <span className="liquid-readable px-4 py-2">YouTube</span>
                )}
              </div>
              <hr className="my-8 border-[#7f99b3]/20" />
              <h2 className="text-lg font-semibold">Giới thiệu tài liệu</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#4f5964]">
                {resource.description || "Tài liệu này chưa có mô tả."}
              </p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {facts.map(([label, value]) => (
                  <div key={label} className="liquid-readable p-4">
                    <dt className="text-[11px] uppercase tracking-wide text-[#7b8490]">{label}</dt>
                    <dd className="mt-2 break-words text-sm font-semibold leading-6">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <LibraryDetailActions resource={resource} />

            {related.length > 0 && (
              <section className="liquid-glass p-5 sm:p-6">
                <h2 className="text-base font-semibold">Tài liệu liên quan</h2>
                <div className="mt-5 space-y-4">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/library/${item.id}`}
                      className="group flex items-center gap-3 rounded-[14px] border border-white/80 bg-white/54 p-3 text-[#1d1d1f] no-underline transition-transform hover:-translate-y-1"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[10px]">
                        <LibraryResourceArtwork resource={item} sizes="100px" />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-5">{item.title}</p>
                        <p className="mt-1 text-xs text-[#6e6e73]">
                          {[item.type, item.sizeLabel].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="liquid-glass p-5 sm:p-6">
              <h2 className="text-base font-semibold">Có câu hỏi về tài liệu?</h2>
              <p className="mt-3 text-sm leading-6 text-[#626a75]">
                Gửi câu hỏi hoặc suy ngẫm của bạn cho ban mục vụ, chúng tôi sẽ phản hồi sớm.
              </p>
              <Link
                href="/contact"
                className="mt-5 flex h-11 items-center justify-center rounded-full border border-[#0066cc]/24 bg-white/58 text-sm font-semibold text-[#0066cc] no-underline"
              >
                Chia sẻ suy ngẫm
              </Link>
            </section>
          </aside>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
