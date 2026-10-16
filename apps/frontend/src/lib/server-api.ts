// Server-side data fetching for SEO (generateMetadata), sitemap and blog pages.
// Fails soft (returns null/empty) so the site still renders without the API.

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  ogImageUrl?: string;
  canonicalBaseUrl?: string;
  twitterHandle?: string;
  pageSeo: {
    path: string;
    title?: string;
    description?: string;
    keywords?: string[];
    ogImageUrl?: string;
    canonical?: string;
    noindex?: boolean;
  }[];
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
  twitterUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  blogEnabled: boolean;
  announcement?: string;
}

export interface BlogPostSummary {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  tags: string[];
  category?: string;
  featured?: boolean;
  noindex?: boolean;
  authorName: string;
  readingMinutes: number;
  publishedAt?: string;
  createdAt: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  noindex?: boolean;
  views: number;
}

async function serverFetch<T>(
  path: string,
  revalidate = 300
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export const getSettings = () => serverFetch<SiteSettings>("/settings", 120);

export const getBlogList = (page = 1, limit = 50) =>
  serverFetch<{
    data: BlogPostSummary[];
    meta: { page: number; total: number; totalPages: number };
  }>(`/blog?page=${page}&limit=${limit}`, 120);

export const getBlogPost = (slug: string) =>
  serverFetch<BlogPost>(`/blog/${encodeURIComponent(slug)}`, 120);

/** Minimal data for the sitemap: all tool + category slugs. */
export const getSitemapTools = () =>
  serverFetch<{ data: { slug: string; updatedAt?: string }[] }>(
    "/tools?limit=1000",
    600
  );

export const getSitemapCategories = () =>
  serverFetch<{ slug: string }[]>("/categories", 600);

export const SITE_BASE = (s?: SiteSettings | null) =>
  s?.canonicalBaseUrl?.replace(/\/$/, "") || "https://rateaimodel.com";

/**
 * Build Next metadata for a route from the dashboard-controlled per-page SEO
 * (falling back to the global defaults). Used by page-level generateMetadata.
 */
export async function pageMetadata(
  path: string,
  fallbackTitle?: string
): Promise<import("next").Metadata> {
  const s = await getSettings();
  const override = s?.pageSeo?.find(p => p.path === path);
  const title =
    override?.title ??
    fallbackTitle ??
    (path === "/" ? (s?.defaultTitle ?? undefined) : undefined);
  const description = override?.description ?? s?.defaultDescription;
  const img = override?.ogImageUrl ?? s?.ogImageUrl;
  const images = img ? [{ url: img }] : undefined;

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    keywords: override?.keywords ?? s?.keywords,
    alternates: { canonical: override?.canonical || path },
    ...(override?.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: path,
      images,
    },
    twitter: { card: "summary_large_image", images },
  };
}
