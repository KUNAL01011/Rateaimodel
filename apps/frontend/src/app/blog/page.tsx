import Link from "next/link";
import type { Metadata } from "next";
import { getBlogList, pageMetadata } from "@/lib/server-api";

export const revalidate = 120;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/blog", "Blog");
}

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogIndex() {
  const res = await getBlogList(1, 50);
  const posts = res?.data ?? [];

  return (
    <div className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Masthead */}
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-4">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--accent)",
                display: "inline-block",
              }}
            />
            <span className="eyebrow">The Journal</span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl mb-4"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Field notes on AI tools
          </h1>
          <p
            className="text-lg max-w-2xl"
            style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}
          >
            Guides, comparisons and honest analysis — how to pick the right model
            for the job, and what the benchmarks don&apos;t tell you.
          </p>
        </div>

        {posts.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ border: "1px solid var(--border)" }}
          >
            <p className="font-display text-xl" style={{ color: "var(--text-primary)" }}>
              No posts yet
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              New writing is on the way — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map(post => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="rounded-xl overflow-hidden mb-4"
                  style={{
                    aspectRatio: "16 / 9",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="eyebrow" style={{ fontSize: 10 }}>
                        RateAI
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {post.tags.slice(0, 1).map(t => (
                    <span key={t} className="badge badge-primary">
                      {t}
                    </span>
                  ))}
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {post.readingMinutes} min read
                  </span>
                </div>
                <h2
                  className="font-display text-xl mb-2 leading-snug group-hover:underline"
                  style={{ color: "var(--text-primary)", textUnderlineOffset: 3 }}
                >
                  {post.title}
                </h2>
                <p
                  className="text-sm leading-relaxed mb-3 line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {post.excerpt}
                </p>
                <p
                  className="text-xs mt-auto"
                  style={{ color: "var(--text-muted)" }}
                >
                  {post.authorName} · {fmtDate(post.publishedAt ?? post.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
