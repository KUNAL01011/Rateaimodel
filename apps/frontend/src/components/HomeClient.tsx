"use client";
import { useFeaturedTools, useTrendingTools, useCategories } from "@/lib/hooks";
import HeroSearch from "@/components/search/HeroSearch";
import ToolCard from "@/components/tools/ToolCard";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star,
  Shield,
  Zap,
  BarChart3,
  AlertCircle,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  "Language Models": "🧠",
  "Image Generation": "🎨",
  "Coding Tools": "💻",
  "AI Agents": "🤖",
  "Audio & Music": "🎵",
  "Video Generation": "🎬",
  "AI Bots & Assistants": "💬",
  "Data & Analytics": "📊",
};

function GridSkeleton({
  count = 3,
  height = "h-64",
}: {
  count?: number;
  height?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`card ${height} shimmer`} />
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4 rounded-lg"
      style={{
        background: "rgba(178,58,43,0.06)",
        border: "1px solid rgba(178,58,43,0.2)",
      }}
    >
      <AlertCircle
        size={16}
        style={{ color: "var(--accent-red)", flexShrink: 0 }}
      />
      <p className="text-sm" style={{ color: "var(--accent-red)" }}>
        {message}
      </p>
    </div>
  );
}

/** Small eyebrow label with a gold tick + leading rule. */
function Eyebrow({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon ?? (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--accent)",
            display: "inline-block",
          }}
        />
      )}
      <span className="eyebrow">{children}</span>
    </div>
  );
}

export default function HomePage() {
  const {
    tools: featured,
    loading: fLoading,
    error: fError,
  } = useFeaturedTools(6);
  const {
    tools: trending,
    loading: tLoading,
    error: tError,
  } = useTrendingTools(6);
  const { categories, loading: cLoading, error: cError } = useCategories();

  // Real, derived platform figures — no fabricated numbers.
  const totalTools = categories.reduce((sum, c) => sum + (c.count || 0), 0);
  const activeCats = categories.filter(c => c.count > 0).length;
  const topCats = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* ── Hero ── */}
      <section className="relative px-6 pt-8 pb-16">
        {/* Masthead */}
        <div className="max-w-6xl mx-auto">
          <div
            className="flex items-center justify-between gap-4 pb-3 mb-12 md:mb-16"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="eyebrow">The AI Review Index</span>
            <span
              className="font-mono text-right"
              style={{ fontSize: 11, color: "var(--text-muted)" }}
            >
              {totalTools > 0 ? (
                <>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {totalTools.toLocaleString()}
                  </span>{" "}
                  tools
                  <span className="mx-1.5 hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    <span style={{ color: "var(--text-secondary)" }}>
                      {activeCats}
                    </span>{" "}
                    categories ·{" "}
                  </span>
                  updated continuously
                </>
              ) : (
                "Independent · Free · Updated continuously"
              )}
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-7 animate-fade-up">
            <Link
              href="/search"
              className="inline-flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full transition-colors hover:border-[var(--primary)]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-strong)",
                textDecoration: "none",
              }}
            >
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--accent-soft)",
                  color: "#8a6508",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                }}
              >
                NEW
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                AI matchmaking — describe your task, get the right tool
              </span>
            </Link>
          </div>

          <h1
            className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl mb-6 animate-fade-up animate-delay-100 leading-[1.05]"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.025em" }}
          >
            The right AI for
            <br />
            <span className="gradient-text">every workflow</span>.
          </h1>

          <p
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-up animate-delay-200"
            style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}
          >
            Independent, use-case-specific ratings for the AI tools that matter
            — from frontier models to autonomous agents. So you choose on
            evidence, not hype.
          </p>

          <div className="animate-fade-up animate-delay-300">
            <HeroSearch />
          </div>

          {/* Category quick-nav — real data */}
          {topCats.length > 0 && (
            <div
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-10 animate-fade-up"
              style={{ animationDelay: "0.4s", opacity: 0 }}
            >
              <span className="eyebrow" style={{ fontSize: 10 }}>
                Browse
              </span>
              {topCats.map(cat => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  <span className="group-hover:text-[var(--primary-bright)]">
                    {cat.name}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 11, color: "var(--text-muted)" }}
                  >
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why RateAI ── */}
      <section className="px-6 py-20" style={{ background: "var(--bg-raised)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <Eyebrow>Methodology</Eyebrow>
            <h2
              className="font-display text-3xl md:text-[2.6rem] mt-4 mb-3 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              A directory tells you what exists. We tell you what&apos;s{" "}
              <span className="gradient-text">actually good</span>.
            </h2>
            <p
              className="text-base"
              style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}
            >
              Every tool is rated across five dimensions, by real verified
              users, for the specific job you&apos;re hiring it to do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <BarChart3 size={20} />,
                title: "Use-case ratings",
                desc: "A model can be excellent for coding and mediocre for writing. We score each job separately.",
              },
              {
                icon: <Shield size={20} />,
                title: "Verified reviews",
                desc: "Email and Google verification mean every review comes from a real, accountable user.",
              },
              {
                icon: <Sparkles size={20} />,
                title: "AI matchmaking",
                desc: "Describe your task in plain language and get matched to the tools that fit it best.",
              },
              {
                icon: <Zap size={20} />,
                title: "Live benchmarks",
                desc: "MMLU, HumanEval, FID and other standardized scores, tracked and kept current.",
              },
            ].map(f => (
              <div key={f.title} className="card p-6">
                <div
                  className="flex items-center justify-center mb-5"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9,
                    background: "var(--primary-wash)",
                    color: "var(--primary)",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-semibold mb-2 text-[15px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Tools ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-9">
            <div>
              <Eyebrow
                icon={
                  <Star
                    size={13}
                    style={{ color: "var(--accent)", fill: "var(--accent)" }}
                  />
                }
              >
                Editor&apos;s Choice
              </Eyebrow>
              <h2
                className="font-display text-3xl md:text-4xl mt-3"
                style={{ color: "var(--text-primary)" }}
              >
                Featured tools
              </h2>
            </div>
            <Link
              href="/search"
              className="btn-secondary text-sm hidden sm:inline-flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {fLoading && <GridSkeleton count={3} height="h-64" />}
          {!fLoading && fError && <ErrorBanner message={fError} />}
          {!fLoading && !fError && featured.length === 0 && (
            <p
              className="text-sm py-8 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              No featured tools yet.
            </p>
          )}
          {!fLoading && !fError && featured.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((tool, i) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  rank={i + 1}
                  variant={i === 0 ? "featured" : "default"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="px-6 py-20" style={{ background: "var(--bg-raised)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-9">
            <div>
              <Eyebrow>Browse</Eyebrow>
              <h2
                className="font-display text-3xl md:text-4xl mt-3"
                style={{ color: "var(--text-primary)" }}
              >
                By category
              </h2>
            </div>
            <Link
              href="/categories"
              className="btn-secondary text-sm hidden sm:inline-flex"
            >
              All categories <ArrowRight size={14} />
            </Link>
          </div>

          {cLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card h-32 shimmer" />
              ))}
            </div>
          )}
          {!cLoading && cError && <ErrorBanner message={cError} />}
          {!cLoading && !cError && categories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...categories]
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map(cat => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="card p-5 flex items-center gap-4 group"
                  style={{ textDecoration: "none" }}
                >
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 9,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      fontSize: 22,
                    }}
                  >
                    {CATEGORY_ICONS[cat.name] ?? "🔮"}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="font-semibold text-sm mb-0.5 truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cat.name}
                    </p>
                    <p
                      className="font-mono text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {cat.count} tools
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-9">
            <Eyebrow
              icon={
                <TrendingUp size={13} style={{ color: "var(--accent-green)" }} />
              }
            >
              Momentum
            </Eyebrow>
            <h2
              className="font-display text-3xl md:text-4xl mt-3"
              style={{ color: "var(--text-primary)" }}
            >
              Trending this week
            </h2>
          </div>

          {tLoading && <GridSkeleton count={3} height="h-48" />}
          {!tLoading && tError && <ErrorBanner message={tError} />}
          {!tLoading && !tError && trending.length === 0 && (
            <p
              className="text-sm py-8 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              No trending tools right now.
            </p>
          )}
          {!tLoading && !tError && trending.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-24 pt-4">
        <div
          className="max-w-5xl mx-auto rounded-2xl px-8 py-14 md:px-16 md:py-16 relative overflow-hidden"
          style={{ background: "var(--primary)" }}
        >
          {/* hairline frame accent */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "inherit",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          />
          <div className="relative max-w-2xl">
            <span
              className="eyebrow"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              For builders
            </span>
            <h2
              className="font-display text-3xl md:text-[2.75rem] mt-4 mb-4 leading-tight"
              style={{ color: "#fff" }}
            >
              Built an AI tool? Get it reviewed.
            </h2>
            <p
              className="text-base md:text-lg mb-8"
              style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}
            >
              List your model, agent, or app and reach the developers and
              creators who rely on RateAI to choose their next tool. Listing is
              free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#fff", color: "var(--primary)" }}
              >
                List your AI — free
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                Explore the directory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
