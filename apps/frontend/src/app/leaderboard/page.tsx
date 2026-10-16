"use client";
import { useState, useEffect } from "react";
import { useTools } from "@/lib/hooks";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import Pagination from "@/components/ui/Pagination";
import {
  Trophy,
  TrendingUp,
  Star,
  Shield,
  Zap,
  GitBranch,
  Crown,
} from "lucide-react";

const LEADERBOARD_CATS = [
  "All",
  "LLM",
  "Image",
  "Code",
  "Audio",
  "Video",
  "Agent",
];

export default function LeaderboardPage() {
  const { tools, loading } = useTools({ limit: 200 });
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "trending">(
    "rating"
  );
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setPage(1);
  }, [activeCategory, sortBy]);

  const filtered = tools
    .filter(t => activeCategory === "All" || t.type === activeCategory)
    .sort((a, b) => {
      if (sortBy === "reviews")
        return b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
      // rating (default): rated first, then by reviews, then alphabetical
      return (
        b.rating - a.rating ||
        b.reviewCount - a.reviewCount ||
        a.name.localeCompare(b.name)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedList = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rankColor = (i: number) => {
    if (i === 0)
      return {
        bg: "rgba(176,130,12,0.12)",
        color: "#8a6508",
        border: "rgba(176,130,12,0.32)",
      };
    if (i === 1)
      return {
        bg: "rgba(100,116,139,0.12)",
        color: "#52607a",
        border: "rgba(100,116,139,0.32)",
      };
    if (i === 2)
      return {
        bg: "rgba(166,108,54,0.14)",
        color: "#8a5a2b",
        border: "rgba(166,108,54,0.32)",
      };
    return {
      bg: "var(--bg-card)",
      color: "var(--text-muted)",
      border: "var(--border)",
    };
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="px-6 py-14 relative overflow-hidden"
        style={{
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 50%, rgba(245,158,11,0.07), transparent 60%)",
          }}
        />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} style={{ color: "var(--accent)" }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Community Rankings
            </span>
          </div>
          <h1
            className="font-display text-5xl mb-3"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            AI Leaderboard
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Every indexed tool, ranked by verified community reviews and
            use-case fit. Updated as new ratings come in.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {LEADERBOARD_CATS.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    activeCategory === cat
                      ? "var(--primary)"
                      : "var(--bg-card)",
                  color:
                    activeCategory === cat ? "white" : "var(--text-secondary)",
                  border: `1px solid ${activeCategory === cat ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: "var(--text-muted)" }}>Sort by:</span>
            {(
              [
                ["rating", "Rating"],
                ["reviews", "Reviews"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className="px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background:
                    sortBy === key ? "var(--bg-card-hover)" : "transparent",
                  color:
                    sortBy === key
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  border: `1px solid ${sortBy === key ? "var(--border-strong)" : "transparent"}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 podium */}
        {!loading && filtered.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 0, 2].map(rankIdx => {
              const tool = filtered[rankIdx];
              if (!tool) return null;
              const styles = rankColor(rankIdx);
              const sizes = rankIdx === 0 ? "scale-105 z-10" : "";
              return (
                <Link
                  key={tool.id}
                  href={`/tool/${tool.slug}`}
                  className={`card p-5 text-center flex flex-col items-center gap-3 transition-all ${sizes}`}
                  style={{
                    textDecoration: "none",
                    border: `1px solid ${styles.border}`,
                    background: styles.bg,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: styles.bg,
                      color: styles.color,
                      border: `1.5px solid ${styles.border}`,
                    }}
                  >
                    {rankIdx === 0 ? <Crown size={14} /> : rankIdx + 1}
                  </div>
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-12 h-12 rounded-xl object-contain"
                    style={{ background: "var(--bg-card)" }}
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${tool.name}&background=1e3a5f&color=fff`;
                    }}
                  />
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tool.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {tool.type}
                    </p>
                  </div>
                  {tool.rating > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={13}
                        style={{ color: "var(--accent)", fill: "var(--accent)" }}
                      />
                      <span
                        className="font-mono font-semibold text-sm"
                        style={{ color: styles.color }}
                      >
                        {tool.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                      }}
                    >
                      Unrated
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Full ranking table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-20 shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {pagedList.map((tool, localIdx) => {
              const i = (page - 1) * PAGE_SIZE + localIdx;
              const styles = rankColor(i);
              return (
                <Link
                  key={tool.id}
                  href={`/tool/${tool.slug}`}
                  className="card flex items-center gap-5 p-5 group"
                  style={{ textDecoration: "none" }}
                >
                  {/* Rank */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: styles.bg,
                      color: styles.color,
                      border: `1px solid ${styles.border}`,
                    }}
                  >
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                  </div>

                  {/* Logo */}
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-full h-full object-contain p-1"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${tool.name}&background=1e3a5f&color=fff`;
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.name}
                      </span>
                      {tool.verified && (
                        <Shield
                          size={11}
                          style={{
                            color: "var(--accent-green)",
                            fill: "var(--accent-green)",
                          }}
                        />
                      )}
                      {tool.isOpenSource && (
                        <GitBranch
                          size={11}
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {tool.type}
                      </span>
                      <span style={{ color: "var(--border)" }}>·</span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        by {tool.owner.name}
                      </span>
                      {tool.hasApi && (
                        <>
                          <span style={{ color: "var(--border)" }}>·</span>
                          <span
                            className="flex items-center gap-0.5 text-xs"
                            style={{ color: "var(--accent-green)" }}
                          >
                            <Zap size={10} /> API
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden md:block text-right">
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Reviews
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.reviewCount.toLocaleString()}
                      </p>
                    </div>
                    {tool.rating > 0 ? (
                      <div className="flex items-center gap-2">
                        <StarRating value={tool.rating} size={13} />
                        <span
                          className="font-mono font-semibold text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {tool.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="badge">New</span>
                    )}
                  </div>
                </Link>
              );
            })}
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>
    </div>
  );
}
