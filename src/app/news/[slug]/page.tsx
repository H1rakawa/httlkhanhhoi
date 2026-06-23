import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import NewsCard from "@/com/news/NewsCard";
import { newsPosts } from "@/com/news/newsData";
import {
  getPublishedNewsPostBySlug,
  getPublishedNewsPosts,
} from "@/lib/news/posts";

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export async function generateStaticParams() {
  return newsPosts.map((post) => ({ slug: post.slug }));
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const post =
    (await getPublishedNewsPostBySlug(slug).catch(() => null)) ||
    newsPosts.find((item) => item.slug === slug);

  if (!post) notFound();

  const posts = await getPublishedNewsPosts().catch(() => newsPosts);
  const availablePosts = posts.length ? posts : newsPosts;
  const relatedPosts = availablePosts
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      <Header activePath="/news" />
      <article className="px-5 pb-20 pt-32 md:pb-24">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/news"
            className="text-sm font-semibold text-[#0066cc] no-underline hover:underline"
          >
            ← Quay lại tin tức
          </Link>
          <p className="mt-10 text-sm font-bold uppercase text-[#0066cc]">
            {post.category}
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-normal md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-5 text-base text-[#6e6e73]">
            {post.author} · {formatDate(post.date)}
          </p>
          <div className="relative mt-10 min-h-[460px] overflow-hidden rounded-[20px]">
            <Image
              src={post.photo}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 896px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-7 text-lg leading-9 text-[#424245]">
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-[#f5f5f7] px-5 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold tracking-normal">
              Bài viết liên quan
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {relatedPosts.map((item) => (
                <NewsCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
