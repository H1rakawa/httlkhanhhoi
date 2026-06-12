"use client";

import { useMemo, useState } from "react";
import NewsCard from "@/com/news/NewsCard";
import NewsFilterBar from "@/com/news/NewsFilterBar";
import Pagination from "@/com/news/Pagination";
import { newsPosts } from "@/com/news/newsData";

const postsPerPage = 6;

export default function NewsFeed() {
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return newsPosts.filter((post) => {
      const matchesCategory = category === "Tất cả" || post.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.excerpt, post.category, post.author]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const currentPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage,
  );

  const updateCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setPage(1);
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  };

  return (
    <>
      <NewsFilterBar
        activeCategory={category}
        query={query}
        onCategoryChange={updateCategory}
        onQueryChange={updateQuery}
      />

      <section className="px-5 py-16 md:py-20">
        <div className="liquid-glass mx-auto max-w-7xl p-5 md:p-8">
          {currentPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentPosts.map((post) => (
                <NewsCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="liquid-readable p-10 text-center text-[#6e6e73]">
              Không tìm thấy bài viết phù hợp.
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>

      <section className="px-5 pb-20 md:pb-24">
        <div className="liquid-glass mx-auto grid max-w-7xl gap-8 p-8 md:grid-cols-[1fr_0.9fr] md:p-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">
              Đăng ký nhận tin tức
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6e6e73]">
              Nhận những thông báo mới nhất và bài chia sẻ ý nghĩa trực tiếp qua
              email của bạn mỗi tuần.
            </p>
          </div>
          <form className="grid gap-4">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="h-12 rounded-[10px] border border-white/90 bg-white/76 px-5 text-sm outline-none focus:border-[#0066cc]"
            />
            <button
              type="submit"
              className="h-12 rounded-[10px] bg-[#0066cc] text-sm font-semibold text-white"
            >
              Đăng ký ngay
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
