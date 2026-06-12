import Image from "next/image";
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
    <article className="liquid-readable overflow-hidden p-2">
      <Link
        href={`/news/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden rounded-[12px] no-underline"
        aria-label={`Đọc bài ${post.title}`}
      >
        <Image
          src={post.photo}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>
      <div className="px-3 pb-4 pt-4">
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
