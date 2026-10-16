"use client";
import Link from "next/link";
import {
  Star,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Zap,
  ShieldCheck,
  GitBranch,
  ArrowRight,
} from "lucide-react";
import { AITool } from "@/lib/types";
import { useSavedTools } from "@/lib/hooks";

interface ToolCardProps {
  tool: AITool;
  rank?: number;
  variant?: "default" | "featured" | "compact";
}

const PRICING_BADGE: Record<string, string> = {
  Free: "badge-green",
  "Open Source": "badge-green",
  Freemium: "badge-amber",
  Paid: "badge",
  Enterprise: "badge",
};

/** Score seal — the editorial "review index" signature. */
function ScoreSeal({ rating, reviews }: { rating: number; reviews: number }) {
  const rated = rating > 0 && reviews > 0;
  return (
    <div
      className="flex flex-col items-center justify-center shrink-0"
      style={{
        width: 62,
        height: 62,
        borderRadius: 10,
        border: `1px solid ${rated ? "rgba(176,130,12,0.35)" : "var(--border)"}`,
        background: rated ? "var(--accent-soft)" : "var(--bg-raised)",
      }}
      title={rated ? `${rating.toFixed(1)} / 5 from ${reviews} reviews` : "Not yet rated"}
    >
      {rated ? (
        <>
          <span
            className="font-display"
            style={{
              fontSize: 24,
              lineHeight: 1,
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            {rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 mt-1">
            <Star size={9} style={{ color: "var(--accent)", fill: "var(--accent)" }} />
            <span
              className="font-mono"
              style={{ fontSize: 9, color: "var(--text-muted)" }}
            >
              {reviews > 999 ? `${(reviews / 1000).toFixed(1)}k` : reviews}
            </span>
          </div>
        </>
      ) : (
        <>
          <span
            className="font-display"
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)" }}
          >
            —
          </span>
          <span
            className="font-mono mt-1"
            style={{
              fontSize: 8,
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            New
          </span>
        </>
      )}
    </div>
  );
}

function LogoTile({
  tool,
  size = 48,
}: {
  tool: AITool;
  size?: number;
}) {
  return (
    <div
      className="flex items-center justify-center shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <img
        src={tool.logo}
        alt={tool.name}
        className="object-contain"
        style={{ width: size * 0.62, height: size * 0.62 }}
        onError={e => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            tool.name
          )}&background=1e3a5f&color=fff`;
        }}
      />
    </div>
  );
}

export default function ToolCard({
  tool,
  rank,
  variant = "default",
}: ToolCardProps) {
  const { toggleSave, isSaved } = useSavedTools();
  const saved = isSaved(tool.id);
  const pricingClass = PRICING_BADGE[tool.pricing] ?? "badge";

  // ── Compact (used in dense lists / AI results) ──────────────────────────────
  if (variant === "compact") {
    return (
      <Link
        href={`/tool/${tool.slug}`}
        className="card flex items-center gap-3.5 p-3.5 group"
        style={{ textDecoration: "none" }}
      >
        <LogoTile tool={tool} size={40} />
        <div className="flex-1 min-w-0">
          <p
            className="font-display text-[15px] truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {tool.name}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {tool.owner.name}
          </p>
        </div>
        {tool.rating > 0 ? (
          <div className="flex items-center gap-1 shrink-0">
            <Star size={12} style={{ color: "var(--accent)", fill: "var(--accent)" }} />
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {tool.rating.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="badge shrink-0">New</span>
        )}
      </Link>
    );
  }

  // ── Default / Featured ──────────────────────────────────────────────────────
  return (
    <div
      className="card relative flex flex-col"
      style={
        variant === "featured"
          ? { boxShadow: "inset 0 0 0 1px rgba(176,130,12,0.28)" }
          : undefined
      }
    >
      {/* Rank seal */}
      {rank && (
        <div
          className="absolute -top-2.5 -left-2.5 z-10 flex items-center justify-center font-mono"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            background: rank === 1 ? "var(--accent)" : "var(--primary)",
            color: "#fff",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {rank}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header: identity + score */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <LogoTile tool={tool} size={48} />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/tool/${tool.slug}`}
                className="font-display text-lg truncate hover:underline"
                style={{
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  textUnderlineOffset: 3,
                }}
              >
                {tool.name}
              </Link>
              {tool.verified && (
                <ShieldCheck
                  size={14}
                  style={{ color: "var(--accent-green)", flexShrink: 0 }}
                />
              )}
            </div>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {tool.owner.name}
            </p>
          </div>
          <ScoreSeal rating={tool.rating} reviews={tool.reviewCount} />
        </div>

        {/* Tagline */}
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {tool.tagline}
        </p>

        {/* Spec row — real, always-present objective data */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          <span className={`badge ${pricingClass}`}>{tool.pricing}</span>
          <span className="badge">{tool.type}</span>
          {tool.contextWindow && (
            <span className="badge">{tool.contextWindow}</span>
          )}
          {tool.hasApi && (
            <span className="badge">
              <Zap size={10} /> API
            </span>
          )}
          {tool.isOpenSource && (
            <span className="badge badge-green">
              <GitBranch size={10} /> OSS
            </span>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link
            href={`/tool/${tool.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium group"
            style={{ color: "var(--primary-bright)", textDecoration: "none" }}
          >
            View details
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="flex items-center gap-1">
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-2 rounded-md transition-colors hover:bg-[var(--bg-raised)]"
              style={{ color: "var(--text-muted)" }}
              title="Visit website"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={e => {
                e.preventDefault();
                toggleSave(tool.id);
              }}
              className="p-2 rounded-md transition-colors hover:bg-[var(--bg-raised)]"
              style={{ color: saved ? "var(--primary-bright)" : "var(--text-muted)" }}
              title={saved ? "Remove from saved" : "Save tool"}
            >
              {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
