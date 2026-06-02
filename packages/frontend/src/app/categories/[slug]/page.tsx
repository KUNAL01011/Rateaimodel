"use client";
import { use } from "react";
import { useTools } from "@/lib/hooks";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import ToolCard from "@/components/tools/ToolCard";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { tools, loading } = useTools();
  const category = MOCK_CATEGORIES.find(c => c.slug === slug);

  const filtered = tools.filter(
    t =>
      t.category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") === slug ||
      t.category.toLowerCase() === (category?.name.toLowerCase() ?? "")
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="px-6 py-14"
        style={{
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            <ArrowLeft size={14} /> All Categories
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1
                className="font-display text-4xl md:text-5xl mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {category?.name ?? slug.replace(/-/g, " ")}
              </h1>
              <p
                className="text-base max-w-2xl"
                style={{ color: "var(--text-secondary)" }}
              >
                {category?.description ?? "Explore tools in this category."}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div
                className="font-display text-3xl"
                style={{ color: "var(--text-primary)" }}
              >
                {category?.count ?? filtered.length}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                indexed tools
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Showing {filtered.length} tools
            </p>
            <button className="flex items-center gap-2 text-sm btn-secondary px-3 py-2">
              <SlidersHorizontal size={13} /> Filters
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card h-56 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔮</div>
              <h3
                className="font-display text-xl mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No tools listed yet
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Know a tool that belongs here?
              </p>
              <Link href="/submit" className="btn-primary text-sm px-6 py-2.5">
                Submit a Tool
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} rank={i + 1} />
              ))}

              {/* Placeholder cards for categories with less mock data */}
              {filtered.length < 3 &&
                Array.from({ length: 3 - filtered.length }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="card p-7 flex flex-col items-center justify-center text-center"
                    style={{
                      minHeight: 200,
                      border: "1px dashed var(--border)",
                    }}
                  >
                    <div className="text-3xl mb-3">✦</div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      More tools coming
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Submit yours to be featured
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
