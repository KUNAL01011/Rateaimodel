"use client";
import { use, useState } from "react";
import {
  useTool,
  useSavedTools,
  useHelpfulVote,
  useReviews,
} from "@/lib/hooks";
import StarRating from "@/components/ui/StarRating";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Shield,
  Bookmark,
  BookmarkCheck,
  Star,
  ThumbsUp,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  GitBranch,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";

type Tab = "overview" | "reviews" | "api";

export default function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { tool, loading, error } = useTool(slug);
  const { toggleSave, isSaved } = useSavedTools();
  const { voteHelpful } = useHelpfulVote();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="h-8 w-48 shimmer rounded-lg mb-8" />
          <div className="flex gap-6 mb-10">
            <div className="w-28 h-28 shimmer rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-64 shimmer rounded-lg" />
              <div className="h-4 w-48 shimmer rounded" />
              <div className="h-4 w-80 shimmer rounded" />
            </div>
          </div>
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2
            className="font-display text-2xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Tool not found
          </h2>
          <Link
            href="/search"
            className="btn-primary text-sm mt-4 inline-block px-6 py-2.5"
          >
            Browse all tools
          </Link>
        </div>
      </div>
    );
  }

  const saved = isSaved(tool.id);

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <MessageSquare size={15} /> },
    {
      key: "reviews",
      label: `Reviews (${tool.reviewCount.toLocaleString()})`,
      icon: <Star size={15} />,
    },
    { key: "api", label: "API & Docs", icon: <Zap size={15} /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div
        className="px-6 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-raised)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            <ArrowLeft size={13} /> All Tools
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {tool.category}
          </span>
          <span style={{ color: "var(--border)" }}>/</span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {tool.name}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section
        className="px-6 py-12 relative overflow-hidden"
        style={{
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.08), transparent 60%)",
          }}
        />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={tool.logo}
                alt={tool.name}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${tool.name}&background=7c3aed&color=fff&size=128`;
                }}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge">{tool.type}</span>
                <span className="badge">{tool.category}</span>
                {tool.verified && (
                  <span className="badge-green badge flex items-center gap-1">
                    <Shield size={10} /> Verified Provider
                  </span>
                )}
                {tool.isOpenSource && (
                  <span className="badge badge-green flex items-center gap-1">
                    <GitBranch size={10} /> Open Source
                  </span>
                )}
              </div>

              <h1
                className="font-display text-3xl md:text-5xl mb-2"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {tool.name}
              </h1>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                by{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  {tool.owner.name}
                </span>
                {tool.website && tool.website !== "#" && (
                  <>
                    <span className="mx-2">·</span>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 transition-opacity hover:opacity-70"
                      style={{ color: "var(--primary)" }}
                    >
                      {tool.website.replace(/^https?:\/\//, "")}{" "}
                      <ExternalLink size={11} />
                    </a>
                  </>
                )}
              </p>
              <p
                className="text-base mt-3 max-w-2xl"
                style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
              >
                {tool.tagline}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[
              {
                label: "Rating",
                value: (
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl">
                      {tool.rating > 0 ? tool.rating.toFixed(1) : "—"}
                    </span>
                    {tool.rating > 0 && (
                      <StarRating value={tool.rating} size={14} />
                    )}
                  </div>
                ),
              },
              {
                label: "Reviews",
                value: (
                  <span className="font-display text-2xl">
                    {tool.reviewCount.toLocaleString()}
                  </span>
                ),
              },
              {
                label: "Pricing",
                value: (
                  <span className="font-semibold text-base">
                    {tool.pricing}
                  </span>
                ),
              },
              {
                label: "API",
                value: (
                  <span className="font-semibold text-base">
                    {tool.hasApi ? "Available" : "No API"}
                  </span>
                ),
              },
              {
                label: "Context",
                value: (
                  <span className="font-mono text-sm">
                    {tool.contextWindow ?? "—"}
                  </span>
                ),
              },
            ].map(m => (
              <div key={m.label}>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {m.label}
                </p>
                <div style={{ color: "var(--text-primary)" }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-6">
            {tool.website && tool.website !== "#" && (
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
              >
                Visit Tool <ExternalLink size={13} />
              </a>
            )}
            <button
              onClick={() => toggleSave(tool.id)}
              className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-2"
            >
              {saved ? (
                <>
                  <BookmarkCheck size={14} /> Saved
                </>
              ) : (
                <>
                  <Bookmark size={14} /> Save
                </>
              )}
            </button>
            <Link
              href={`/write-review?tool=${tool.id}&slug=${tool.slug}`}
              className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <Star size={14} /> Write Review
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div
        className="px-6"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-raised)",
        }}
      >
        <div className="max-w-5xl mx-auto flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all relative"
              style={{
                color:
                  activeTab === tab.key
                    ? "var(--primary-bright)"
                    : "var(--text-muted)",
              }}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ background: "var(--primary)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {activeTab === "overview" && <OverviewTab tool={tool} />}
        {activeTab === "reviews" && (
          <ReviewsTab tool={tool} voteHelpful={voteHelpful} />
        )}
        {activeTab === "api" && <ApiTab tool={tool} />}
      </div>
    </div>
  );
}

/* ─── Overview Tab ─────────────────────────────────────────────────── */
function OverviewTab({
  tool,
}: {
  tool: NonNullable<ReturnType<typeof useTool>["tool"]>;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About */}
        <div className="md:col-span-2 card p-7">
          <h2
            className="font-display text-xl mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            About {tool.name}
          </h2>
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "var(--text-secondary)" }}
          >
            {tool.description}
          </p>
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tool.tags.map(tag => (
                <span key={tag} className="badge">
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="card p-6 space-y-4">
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Specifications
          </h3>
          {[
            { label: "Pricing", value: tool.pricing },
            { label: "Context Window", value: tool.contextWindow ?? "N/A" },
            { label: "Has API", value: tool.hasApi ? "Yes" : "No" },
            { label: "Open Source", value: tool.isOpenSource ? "Yes" : "No" },
          ].map(spec => (
            <div key={spec.label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {spec.label}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating breakdown — only if we have data */}
      {Object.values(tool.ratingBreakdown).some(v => v > 0) && (
        <div className="card p-7">
          <h2
            className="font-display text-xl mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Performance Ratings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(tool.ratingBreakdown)
              .filter(([, val]) => val > 0)
              .map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: "var(--text-secondary)" }}>
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, s => s.toUpperCase())}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--primary-bright)" }}
                    >
                      {val.toFixed(1)}/5
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-card-hover)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(val / 5) * 100}%`,
                        background:
                          "linear-gradient(90deg, var(--primary-dim), var(--primary))",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Benchmarks */}
      {tool.benchmarks.length > 0 && (
        <div className="card p-7">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="font-display text-xl"
              style={{ color: "var(--text-primary)" }}
            >
              Industry Benchmarks
            </h2>
            <span className="badge">Verified Data</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Benchmark", "Score", ""].map(h => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tool.benchmarks.map(b => (
                  <tr
                    key={b.name}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="py-4 px-4 text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {b.name}
                    </td>
                    <td
                      className="py-4 px-4 text-sm font-semibold font-mono"
                      style={{ color: "var(--primary-bright)" }}
                    >
                      {b.score}
                    </td>
                    <td className="py-4 px-4">
                      {b.vsAvg && (
                        <span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{
                            color: b.positive
                              ? "var(--accent-green)"
                              : "var(--accent-red)",
                          }}
                        >
                          {b.positive ? (
                            <ArrowUpRight size={13} />
                          ) : (
                            <ArrowDownRight size={13} />
                          )}
                          {b.vsAvg}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provider */}
      <div className="card p-7">
        <h2
          className="font-display text-xl mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          About the Provider
        </h2>
        <div className="flex items-start gap-5">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <img
              src={
                tool.owner.logo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.owner.name)}&background=7c3aed&color=fff`
              }
              alt={tool.owner.name}
              className="w-full h-full object-contain p-2"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.owner.name)}&background=7c3aed&color=fff`;
              }}
            />
          </div>
          <div className="flex-1">
            <h3
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {tool.owner.name}
            </h3>
            {tool.owner.description && (
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {tool.owner.description}
              </p>
            )}
            {tool.owner.website && tool.owner.website !== "#" && (
              <a
                href={tool.owner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Visit website <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reviews Tab — fetches from API ──────────────────────────────── */
function ReviewsTab({
  tool,
  voteHelpful,
}: {
  tool: NonNullable<ReturnType<typeof useTool>["tool"]>;
  voteHelpful: (id: string) => void;
}) {
  // Fetch real reviews from API using the tool's _id
  const { reviews, loading: reviewsLoading } = useReviews(tool.id);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar stats */}
      <div className="lg:w-72 shrink-0">
        <div className="card p-6 sticky top-24">
          <h2
            className="font-display text-xl mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Community Score
          </h2>
          <div className="flex items-end gap-3 mb-5">
            <span
              className="font-display text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              {tool.rating > 0 ? tool.rating.toFixed(1) : "—"}
            </span>
            {tool.rating > 0 && (
              <div className="mb-1">
                <StarRating value={tool.rating} size={16} />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {tool.reviewCount.toLocaleString()} verified reviews
                </p>
              </div>
            )}
          </div>

          {Object.values(tool.ratingBreakdown).some(v => v > 0) && (
            <div className="space-y-3 mb-6">
              {Object.entries(tool.ratingBreakdown)
                .filter(([, val]) => val > 0)
                .map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, s => s.toUpperCase())}
                      </span>
                      <span style={{ color: "var(--primary-bright)" }}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                    <div
                      className="h-1 rounded-full"
                      style={{ background: "var(--bg-card-hover)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(val / 5) * 100}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          <Link
            href={`/write-review?tool=${tool.id}&slug=${tool.slug}`}
            className="btn-primary w-full text-sm py-2.5 text-center block"
          >
            Write a Review
          </Link>
          <p
            className="text-xs text-center mt-2"
            style={{ color: "var(--text-muted)" }}
          >
            Requires Google sign-in to verify identity
          </p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="flex-1 space-y-5">
        {reviewsLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "var(--primary)" }}
            />
          </div>
        )}

        {!reviewsLoading && reviews.length === 0 && (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">✍️</div>
            <h3
              className="font-display text-lg mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No reviews yet
            </h3>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              Be the first to share your experience with {tool.name}
            </p>
            <Link
              href={`/write-review?tool=${tool.id}&slug=${tool.slug}`}
              className="btn-primary text-sm px-6 py-2.5"
            >
              Write the First Review
            </Link>
          </div>
        )}

        {!reviewsLoading &&
          reviews.map(review => (
            <div key={review.id} className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "var(--primary-dim)", color: "white" }}
                  >
                    {review.userInitials}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {review.userName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {review.useCase.replace(/_/g, " ")} · {review.date}
                    </p>
                  </div>
                </div>
                <StarRating value={review.rating} size={14} />
              </div>

              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {review.body}
              </p>

              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {review.pros.length > 0 && (
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: "var(--accent-green)" }}
                      >
                        Pros
                      </p>
                      <ul className="space-y-1">
                        {review.pros.map((p, i) => (
                          <li
                            key={i}
                            className="text-xs flex items-start gap-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <span style={{ color: "var(--accent-green)" }}>
                              +
                            </span>{" "}
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: "var(--accent-red)" }}
                      >
                        Cons
                      </p>
                      <ul className="space-y-1">
                        {review.cons.map((c, i) => (
                          <li
                            key={i}
                            className="text-xs flex items-start gap-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <span style={{ color: "var(--accent-red)" }}>
                              −
                            </span>{" "}
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div
                className="flex items-center gap-4 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => voteHelpful(review.id)}
                  className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ThumbsUp size={13} /> Helpful ({review.helpful})
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ─── API Tab ─────────────────────────────────────────────────────── */
function ApiTab({
  tool,
}: {
  tool: NonNullable<ReturnType<typeof useTool>["tool"]>;
}) {
  const CODE_EXAMPLE = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: "${tool.slug.includes("claude") ? "claude-sonnet-4-6" : "gpt-4o"}",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(message.content);`;

  if (!tool.hasApi) {
    return (
      <div className="card p-10 text-center max-w-xl mx-auto">
        <div className="text-4xl mb-4">🔒</div>
        <h3
          className="font-display text-xl mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          No public API
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {tool.name} does not currently offer a public API. Check their website
          for updates.
        </p>
        {tool.website && tool.website !== "#" && (
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm mt-5 inline-flex items-center gap-2"
          >
            Visit Website <ExternalLink size={13} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="card p-6">
        <h2
          className="font-display text-xl mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Quick Start
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          Get up and running with {tool.name} in under 5 minutes.
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              background: "var(--bg-raised)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              TypeScript
            </span>
            <button
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
              onClick={() => navigator.clipboard.writeText(CODE_EXAMPLE)}
            >
              Copy
            </button>
          </div>
          <pre
            className="p-5 text-xs leading-relaxed overflow-x-auto font-mono"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Official Docs",
            desc: "Complete API reference, guides, and examples.",
            href: tool.apiDocs ?? tool.website,
            label: "Read Docs",
          },
          {
            title: "Rate Limits",
            desc: "Understand request limits, token quotas, and pricing tiers.",
            href: tool.website,
            label: "View Limits",
          },
        ].map(item => (
          <div key={item.title} className="card p-5">
            <h3
              className="font-semibold text-sm mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {item.title}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {item.desc}
            </p>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              {item.label} <ExternalLink size={11} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
