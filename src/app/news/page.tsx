import Link from "next/link";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import NewsFeed from "@/com/news/NewsFeed";
import { newsPosts } from "@/com/news/newsData";

export default function NewsPage() {
  const featuredPost = newsPosts.find((post) => post.featured) || newsPosts[0];

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Header activePath="/news" />
      <section className="relative isolate flex min-h-[720px] items-end overflow-hidden bg-black px-5 pb-24 pt-24 text-white">
        <div className="news-hero-image absolute inset-0 opacity-72" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.58)_45%,rgba(0,0,0,0.34))]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="inline-flex rounded-full bg-[#0066cc] px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
            Tin tiêu điểm
          </p>
          <h1 className="mt-6 max-w-3xl text-6xl font-semibold leading-tight tracking-normal">
            {featuredPost.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/82">
            {featuredPost.excerpt}
          </p>
          <Link
            href={`/news/${featuredPost.slug}`}
            className="mt-8 inline-flex h-11 items-center rounded-[10px] bg-white px-7 text-sm font-semibold text-[#1d1d1f] no-underline transition-colors hover:bg-[#e8f2ff] hover:text-[#0066cc]"
          >
            Đọc tiếp
          </Link>
        </div>
      </section>
      <NewsFeed />
      <Footer />
    </main>
  );
}
