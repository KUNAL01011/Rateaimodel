"use client";
import { useCategories } from "@/lib/hooks";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Image,
  Code,
  Bot,
  Music,
  Video,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Language Models": <Brain size={28} />,
  "Image Generation": <Image size={28} />,
  "Coding Tools": <Code size={28} />,
  "AI Agents": <Bot size={28} />,
  "Audio & Music": <Music size={28} />,
  "Video Generation": <Video size={28} />,
  "AI Bots & Assistants": <MessageSquare size={28} />,
  "Data & Analytics": <BarChart3 size={28} />,
};

export default function CategoriesPage() {
  const { categories, loading } = useCategories();
  const totalTools = categories.reduce((sum, c) => sum + (c.count || 0), 0);
  const activeCats = categories.filter(c => c.count > 0).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="px-6 py-16 relative overflow-hidden"
        style={{ background: "var(--bg-raised)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(30,58,95,0.05), transparent 60%)",
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs"
            style={{
              background: "rgba(30,58,95,0.1)",
              border: "1px solid rgba(30,58,95,0.2)",
              color: "var(--primary)",
            }}
          >
            {activeCats || "—"} Categories · {totalTools.toLocaleString()} Tools
          </div>
          <h1
            className="font-display text-5xl md:text-6xl mb-4"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Every type of AI,
            <br />
            <span className="gradient-text">categorized.</span>
          </h1>
          <p
            className="text-lg max-w-2xl"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            From foundational language models to autonomous agents — browse our
            hand-curated taxonomy of artificial intelligence.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card h-52 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...categories]
                .sort((a, b) => b.count - a.count)
                .map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="card glow-card p-7 flex flex-col justify-between group min-h-52"
                  style={{
                    textDecoration: "none",
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <span
                    className="absolute top-6 right-7 font-mono"
                    style={{ fontSize: 12, color: "var(--text-muted)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105"
                      style={{
                        background: "var(--primary-wash)",
                        color: "var(--primary)",
                      }}
                    >
                      {ICON_MAP[cat.name] || <Bot size={28} />}
                    </div>
                    <h2
                      className="font-display text-xl mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cat.name}
                    </h2>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cat.description}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-between mt-6 pt-5"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <span
                      className="font-mono text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cat.count} {cat.count === 1 ? "tool" : "tools"}
                    </span>
                    <span
                      className="flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--primary-bright)" }}
                    >
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
