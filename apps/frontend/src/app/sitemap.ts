import type { MetadataRoute } from "next";
import {
  getSettings,
  SITE_BASE,
  getBlogList,
  getSitemapTools,
  getSitemapCategories,
} from "@/lib/server-api";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const base = SITE_BASE(settings);
  const now = new Date();

  const noindexPaths = new Set(
    (settings?.pageSeo ?? []).filter(p => p.noindex).map(p => p.path)
  );

  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: `${base}`, path: "/", changeFrequency: "daily", priority: 1 },
      { url: `${base}/search`, path: "/search", changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/categories`, path: "/categories", changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/leaderboard`, path: "/leaderboard", changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/blog`, path: "/blog", changeFrequency: "daily", priority: 0.8 },
      { url: `${base}/submit`, path: "/submit", changeFrequency: "monthly", priority: 0.4 },
    ] as const
  )
    .filter(p => !noindexPaths.has(p.path))
    .map(({ path: _p, ...rest }) => ({ lastModified: now, ...rest }));

  const cats = (await getSitemapCategories()) ?? [];
  const catUrls: MetadataRoute.Sitemap = cats.map(c => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tools = (await getSitemapTools())?.data ?? [];
  const toolUrls: MetadataRoute.Sitemap = tools.map(t => ({
    url: `${base}/tool/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blog = (await getBlogList(1, 1000))?.data ?? [];
  const blogUrls: MetadataRoute.Sitemap = blog
    .filter(b => !b.noindex)
    .map(b => ({
      url: `${base}/blog/${b.slug}`,
      lastModified: b.publishedAt ? new Date(b.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticPages, ...catUrls, ...toolUrls, ...blogUrls];
}
