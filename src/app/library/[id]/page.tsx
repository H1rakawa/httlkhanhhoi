import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import LibraryBackdrop from "@/com/library/LibraryBackdrop";
import LibraryDetailActions from "@/com/library/LibraryDetailActions";
import { LibraryResourceArtwork } from "@/com/library/LibraryResourceCard";
import {
  fallbackResources,
  LibraryResource,
  normalizeResourceType,
} from "@/com/library/libraryData";
import { supabaseDataRequest } from "@/lib/supabase/auth";

type LibraryDetailPageProps = {
  params: Promise<{ id: string }>;
};

const detailContent: Record<
  LibraryResource["type"],
  { category: string; abstract: string; highlights: string[]; metric: string }
> = {
  PDF: {
    category: "Tài liệu thực hành",
    abstract:
      "Tài liệu được biên soạn để biến những ý tưởng thuộc linh thành nhịp sống thực tế. Nội dung cô đọng, dễ ghi chú và phù hợp cho cả giờ tĩnh nguyện cá nhân lẫn học nhóm.",
    highlights: ["Hướng dẫn từng bước", "Câu hỏi suy ngẫm", "Trang ghi chú thực hành"],
    metric: "12 phút đọc",
  },
  Video: {
    category: "Bài học trực quan",
    abstract:
      "Một trải nghiệm hình ảnh được xây dựng để giúp người xem tiếp cận chủ đề theo cách gần gũi, rõ ràng và dễ ứng dụng trong đời sống hằng ngày.",
    highlights: ["Thông điệp trọng tâm", "Ví dụ thực tế", "Gợi ý áp dụng trong tuần"],
    metric: "28 phút xem",
  },
  Sách: {
    category: "Tuyển tập chuyên sâu",
    abstract:
      "Cuốn sách dẫn người đọc đi qua một hành trình có chiều sâu, kết nối nền tảng đức tin với những câu hỏi chân thật của đời sống hiện đại.",
    highlights: ["Nội dung theo chương", "Bài tập cuối phần", "Đề xuất học nhóm"],
    metric: "45 phút đọc",
  },
  "Bài giảng": {
    category: "Thông điệp nuôi dưỡng",
    abstract:
      "Bài giảng mở ra một góc nhìn sâu sắc từ Kinh Thánh, đồng thời gợi ý cách mang thông điệp ấy vào các mối quan hệ, công việc và cộng đồng.",
    highlights: ["Kinh Thánh nền tảng", "Ba ý chính", "Lời cầu nguyện đáp ứng"],
    metric: "32 phút nghe",
  },
  "Âm thanh": {
    category: "Không gian tĩnh lặng",
    abstract:
      "Tuyển tập âm thanh tạo nên một khoảng lặng có chủ đích, giúp người nghe chậm lại, suy ngẫm và bước vào giờ cầu nguyện với sự tập trung.",
    highlights: ["Khởi đầu tĩnh lặng", "Suy ngẫm có hướng dẫn", "Cầu nguyện kết thúc"],
    metric: "24 phút nghe",
  },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function generateStaticParams() {
  return fallbackResources.map((resource) => ({ id: resource.id }));
}

async function getResource(id: string) {
  const fallback = fallbackResources.find((item) => item.id === id);
  if (fallback) return fallback;

  try {
    const resources = await supabaseDataRequest<
      Array<{
        id: number;
        title: string;
        type: string;
        url: string;
        thumbnail_url: string | null;
        mime_type: string | null;
        size_bytes: number | null;
        created_at: string;
        media_asset:
          | {
              public_url: string;
              media_kind: string;
              mime_type: string;
              size_bytes: number;
            }
          | null;
      }>
    >(`resources?id=eq.${encodeURIComponent(id)}&select=id,title,type,url,thumbnail_url,mime_type,size_bytes,created_at,media_asset:media_asset_id(public_url,media_kind,mime_type,size_bytes)&limit=1`);
    const resource = resources[0];
    if (!resource) return null;

    const imageIndex = Math.abs(Number(resource.id) || 0) % fallbackResources.length;
    return {
      id: String(resource.id),
      title: resource.title,
      description:
        "Tài liệu được tuyển chọn từ thư viện HTTL. Khánh Hội, hỗ trợ học hỏi và trưởng thành trong đức tin.",
      type: normalizeResourceType(resource.type),
      url: resource.media_asset?.public_url || resource.url,
      image:
        resource.thumbnail_url ||
        (resource.media_asset?.media_kind === "image" ? resource.media_asset.public_url : "") ||
        fallbackResources[imageIndex].image,
      createdAt: resource.created_at.slice(0, 10),
    } satisfies LibraryResource;
  } catch {
    return null;
  }
}

export default async function LibraryDetailPage({
  params,
}: LibraryDetailPageProps) {
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  const content = detailContent[resource.type];
  const related = fallbackResources
    .filter((item) => item.id !== resource.id)
    .sort((a, b) => Number(b.type === resource.type) - Number(a.type === resource.type))
    .slice(0, 2);

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
              <div className="group relative aspect-[16/10] overflow-hidden rounded-[20px] shadow-[0_28px_70px_rgba(7,17,31,0.24)]">
                <LibraryResourceArtwork resource={resource} sizes="900px" />
                <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-[#87620c]/88 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
                  {content.category}
                </span>
                {(resource.type === "Video" || resource.type === "Âm thanh" || resource.type === "Bài giảng") && (
                  <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/70 text-3xl text-[#0066cc] shadow-2xl backdrop-blur-xl">
                    <span className="ml-1">▶</span>
                  </span>
                )}
              </div>
            </section>

            <article className="liquid-glass p-6 sm:p-9 md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">
                {resource.type} · {content.metric}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                {resource.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#626a75]">
                <span className="liquid-readable px-4 py-2">HTTL. Khánh Hội</span>
                <span className="liquid-readable px-4 py-2">{formatDate(resource.createdAt)}</span>
                <span className="liquid-readable px-4 py-2">{content.category}</span>
              </div>
              <hr className="my-8 border-[#7f99b3]/20" />
              <h2 className="text-lg font-semibold">Giới thiệu tài liệu</h2>
              <p className="mt-4 text-base leading-8 text-[#4f5964]">
                {content.abstract}
              </p>
              <p className="mt-4 text-base leading-8 text-[#4f5964]">
                {resource.description} Tài liệu được tuyển chọn để đồng hành cùng
                bạn trong hành trình học hỏi, suy ngẫm và trưởng thành mỗi ngày.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {content.highlights.map((highlight, index) => (
                  <div key={highlight} className="liquid-readable p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0066cc] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="mt-4 text-sm font-semibold leading-6">{highlight}</p>
                  </div>
                ))}
              </div>
              <div className="mt-9 flex items-center gap-3 text-sm font-medium text-[#626a75]">
                <div className="flex -space-x-3">
                  {["#d5e6ff", "#77b4e8", "#1b729f"].map((color) => (
                    <span
                      key={color}
                      className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span>Được cộng đồng quan tâm trong tuần này</span>
              </div>
            </article>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <LibraryDetailActions resource={resource} />

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
                      <p className="mt-1 text-xs text-[#6e6e73]">{item.type} · {detailContent[item.type].metric}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="liquid-glass p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Thảo luận</h2>
                <span className="rounded-full bg-[#0066cc]/10 px-3 py-1 text-xs font-semibold text-[#0066cc]">24</span>
              </div>
              <div className="mt-5 rounded-[14px] border border-white/80 bg-white/54 p-4">
                <p className="text-sm font-semibold">Một thành viên cộng đồng</p>
                <p className="mt-2 text-sm italic leading-6 text-[#626a75]">
                  “Nội dung này giúp tôi nhìn chủ đề theo một cách thực tế và gần gũi hơn.”
                </p>
              </div>
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
