import Link from "next/link";
import { NewsPost } from "@/com/news/newsData";

const categoryClass: Record<NewsPost["category"], string> = {
  "Tin tức": "text-[#0066cc]",
  "Thông báo": "text-[#7b61ff]",
  "Bài chia sẻ": "text-[#178a45]",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="rounded-[14px] border border-[#dedee3] bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-sm">
      <Link
        href={`/news/${post.slug}`}
        className={`news-image-${post.image} block min-h-44 rounded-[10px] no-underline`}
        aria-label={`Đọc bài ${post.title}`}
      />
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase text-[#8a8a8f]">
          <span className={categoryClass[post.category]}>{post.category}</span>
          <span className="mx-2">·</span>
          {formatDate(post.date)}
        </p>
        <Link
          href={`/news/${post.slug}`}
          className="mt-3 block text-xl font-semibold leading-snug text-[#1d1d1f] no-underline hover:text-[#0066cc]"
        >
          {post.title}
        </Link>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6e6e73]">
          {post.excerpt}
        </p>
      </div>
    </article>
  );
}
