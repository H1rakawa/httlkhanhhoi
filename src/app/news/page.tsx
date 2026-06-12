import Image from "next/image";
import Link from "next/link";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import NewsBackdrop from "@/com/news/NewsBackdrop";
import NewsFeed from "@/com/news/NewsFeed";
import { newsPosts } from "@/com/news/newsData";

export default function NewsPage() {
  const featuredPost = newsPosts.find((post) => post.featured) || newsPosts[0];

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <NewsBackdrop />
      <Header activePath="/news" />
      <section className="relative z-10 flex min-h-[720px] items-center overflow-hidden px-5 pb-20 pt-28">
        <Image
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=88"
          alt="Khung cảnh bình an"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-white/12" />
        <div className="liquid-glass relative z-10 mx-auto w-full max-w-7xl px-8 py-14 text-center md:px-16 md:py-16">
          <p className="inline-flex rounded-full bg-[#0066cc] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            Tin tiêu điểm
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-normal md:text-6xl">
            {featuredPost.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#59616d]">
            {featuredPost.excerpt}
          </p>
          <Link
            href={`/news/${featuredPost.slug}`}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-[#0066cc] px-7 text-sm font-semibold text-white no-underline"
          >
            Đọc tiếp
          </Link>
        </div>
      </section>
      <div className="relative z-10">
        <NewsFeed />
        <Footer />
      </div>
    </main>
  );
}
