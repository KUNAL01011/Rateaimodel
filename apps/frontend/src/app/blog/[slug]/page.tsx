import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft } from "lucide-react";
import { getBlogPost, getSettings, SITE_BASE } from "@/lib/server-api";

export const revalidate = 120;

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post not found" };

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt;
  const image = post.ogImageUrl ?? post.coverImageUrl;
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    ...(post.noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      images,
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getBlogPost(slug), getSettings()]);
  if (!post) notFound();

  const html = await marked.parse(post.content);
  const base = SITE_BASE(settings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.ogImageUrl ?? post.coverImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: post.authorName },
    publisher: {
      "@type": "Organization",
      name: settings?.siteName ?? "RateAI",
    },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
  };

  return (
    <article className="px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} /> All posts
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {post.tags.map(t => (
            <span key={t} className="badge badge-primary">
              {t}
            </span>
          ))}
        </div>

        <h1
          className="font-display text-4xl md:text-5xl mb-5 leading-[1.1]"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          {post.title}
        </h1>

        <p
          className="font-mono text-xs mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          {post.authorName} · {fmtDate(post.publishedAt ?? post.createdAt)} ·{" "}
          {post.readingMinutes} min read
        </p>

        {post.coverImageUrl && (
          <div
            className="rounded-xl overflow-hidden mb-10"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <div
          className="mt-14 pt-8"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link href="/blog" className="btn-secondary text-sm">
            <ArrowLeft size={14} /> Back to all posts
          </Link>
        </div>
      </div>
    </article>
  );
}
