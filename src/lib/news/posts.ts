import { NewsPost } from "@/com/news/newsData";
import { supabaseDataRequest } from "@/lib/supabase/auth";

export type ApiNewsPost = {
  id: number;
  slug: string;
  title: string;
  category: NewsPost["category"];
  author_name: string;
  excerpt: string;
  content: string[];
  image_key: NewsPost["image"];
  photo_url: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const newsSelect =
  "id,slug,title,category,author_name,excerpt,content,image_key,photo_url,featured,status,published_at,created_at,updated_at";

function toDateOnly(value: string | null) {
  return (value || new Date().toISOString()).slice(0, 10);
}

export function mapApiNewsPost(post: ApiNewsPost): NewsPost {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    date: toDateOnly(post.published_at || post.created_at),
    author: post.author_name,
    excerpt: post.excerpt,
    content: post.content?.length ? post.content : [post.excerpt],
    image: post.image_key,
    photo: post.photo_url,
    featured: post.featured,
  };
}

export async function getPublishedNewsPosts() {
  const posts = await supabaseDataRequest<ApiNewsPost[]>(
    `news_posts?select=${newsSelect}&status=eq.published&order=published_at.desc.nullslast,created_at.desc`,
  );

  return posts.map(mapApiNewsPost);
}

export async function getPublishedNewsPostBySlug(slug: string) {
  const posts = await supabaseDataRequest<ApiNewsPost[]>(
    `news_posts?select=${newsSelect}&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );

  return posts[0] ? mapApiNewsPost(posts[0]) : null;
}
