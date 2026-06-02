"use client";
import { useFeaturedTools, useTrendingTools } from "@/lib/hooks";
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
} from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mockData";

const STATS = [
  { value: "2,400+", label: "AI Tools Indexed" },
  { value: "84,000+", label: "Verified Reviews" },
  { value: "320K+", label: "Monthly Users" },
  { value: "48", label: "Categories" },
];

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

export default function HomePage() {
  const { tools: featured, loading: fLoading } = useFeaturedTools();
  const { tools: trending, loading: tLoading } = useTrendingTools();

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-medium animate-fade-up"
            style={{
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.2)",
              color: "var(--primary-bright)",
            }}
          >
            <Sparkles size={12} />
            AI-Powered Recommendation Engine Now Live
          </div>

          <h1
            className="font-display text-5xl md:text-7xl mb-6 animate-fade-up animate-delay-100 leading-[1.08]"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
          >
            Find the <span className="gradient-text">Right AI</span> for
            <br />
            Every Workflow.
          </h1>

          <p
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-up animate-delay-200"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            Discover, compare, and review 2,400+ AI tools — from frontier LLMs
            to autonomous agents. Use-case specific ratings so you pick the
            right tool, not just the most hyped.
          </p>

          <div className="animate-fade-up animate-delay-300">
            <HeroSearch />
          </div>

          {/* Stats bar */}
          <div
            className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-up"
            style={{ animationDelay: "0.4s", opacity: 0 }}
          >
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RateAI */}
      <section
        className="px-6 py-20"
        style={{ background: "var(--bg-raised)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="font-display text-3xl md:text-4xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Not just a directory. An{" "}
              <span className="gradient-text">intelligence layer</span>.
            </h2>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Every tool rated across 5 dimensions. Every review verified. Every
              recommendation powered by AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BarChart3 size={22} />,
                title: "Use-Case Ratings",
                desc: "A tool can be great for coding but poor for writing. We capture that nuance.",
              },
              {
                icon: <Shield size={22} />,
                title: "Verified Reviews",
                desc: "Email verification and Google login ensure every review comes from real users.",
              },
              {
                icon: <Sparkles size={22} />,
                title: "AI Matchmaking",
                desc: "Describe your task in natural language and we'll match you to the perfect tool.",
              },
              {
                icon: <Zap size={22} />,
                title: "Live Benchmarks",
                desc: "Track MMLU, HumanEval, FID, and other standardized scores updated in real-time.",
              },
            ].map(f => (
              <div key={f.title} className="card p-6 glow-card">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(167,139,250,0.1)",
                    color: "var(--primary)",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-semibold mb-2 text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} style={{ color: "var(--accent)" }} />
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Editor's Choice
                </span>
              </div>
              <h2
                className="font-display text-3xl"
                style={{ color: "var(--text-primary)" }}
              >
                Featured Artifacts
              </h2>
            </div>
            <Link
              href="/search"
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {fLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 h-64 shimmer" />
              ))}
            </div>
          ) : (
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

      {/* Categories */}
      <section
        className="px-6 py-20"
        style={{ background: "var(--bg-raised)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="font-display text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Browse by Category
            </h2>
            <Link
              href="/categories"
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              All Categories <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="card p-5 flex flex-col gap-3 group"
                style={{ textDecoration: "none" }}
              >
                <span className="text-3xl">
                  {CATEGORY_ICONS[cat.name] || "🔮"}
                </span>
                <div>
                  <p
                    className="font-semibold text-sm mb-0.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cat.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {cat.count} tools
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={18} style={{ color: "var(--primary)" }} />
            <h2
              className="font-display text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Trending This Week
            </h2>
          </div>
          {tLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 h-48 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.slice(0, 6).map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-16">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.2), transparent 70%)",
            }}
          />
          <h2
            className="font-display text-3xl md:text-4xl mb-4 relative"
            style={{ color: "var(--text-primary)" }}
          >
            Built an AI tool? Get discovered.
          </h2>
          <p
            className="text-base mb-8 relative"
            style={{ color: "var(--text-secondary)" }}
          >
            List your model, agent, or bot on RateAI. Reach 320,000+ developers
            and creators who trust our platform to find their next tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link href="/submit" className="btn-primary px-8 py-3 text-sm">
              List Your AI — It's Free
            </Link>
            <Link
              href="/categories"
              className="btn-secondary px-8 py-3 text-sm"
            >
              Explore Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
