import type { MetadataRoute } from "next";
import { getPublishedNewsPosts } from "@/lib/news/posts";
import { getPublishedResources } from "@/lib/library/resources";
import { SITE_URL } from "@/lib/site";

/** Làm mới sitemap mỗi giờ để có bài viết / tài liệu mới. */
export const revalidate = 3600;

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/news", priority: 0.9, changeFrequency: "daily" },
  { path: "/calendar", priority: 0.8, changeFrequency: "weekly" },
  { path: "/library", priority: 0.8, changeFrequency: "weekly" },
  { path: "/preachout", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pray", priority: 0.7, changeFrequency: "daily" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/term", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, resources] = await Promise.all([
    getPublishedNewsPosts().catch(() => []),
    getPublishedResources().catch(() => []),
  ]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/news/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...resources.map((resource) => ({
      url: `${SITE_URL}/library/${resource.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
