"use client";
import Link from "next/link";
import {
  Star,
  ExternalLink,
  BookmarkPlus,
  BookmarkCheck,
  Zap,
  Shield,
} from "lucide-react";
import { AITool } from "@/lib/types";
import { useSavedTools } from "@/lib/hooks";

interface ToolCardProps {
  tool: AITool;
  rank?: number;
  variant?: "default" | "featured" | "compact";
}

export default function ToolCard({
  tool,
  rank,
  variant = "default",
}: ToolCardProps) {
  const { toggleSave, isSaved } = useSavedTools();
  const saved = isSaved(tool.id);

  const pricingColor =
    {
      Free: "badge-green",
      Freemium: "badge-amber",
      Paid: "badge",
      Enterprise: "badge",
      "Open Source": "badge-green",
    }[tool.pricing] || "badge";

  if (variant === "compact") {
    return (
      <Link
        href={`/tool/${tool.slug}`}
        className="card flex items-center gap-4 p-4 group"
        style={{ textDecoration: "none" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <img
            src={tool.logo}
            alt={tool.name}
            className="w-7 h-7 object-contain"
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${tool.name}&background=7c3aed&color=fff`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {tool.name}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {tool.category}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Star
            size={12}
            style={{ color: "var(--accent)", fill: "var(--accent)" }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {tool.rating}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`card glow-card relative overflow-hidden ${variant === "featured" ? "ring-1" : ""}`}
      style={{ "--ring-color": "rgba(167,139,250,0.2)" } as React.CSSProperties}
    >
      {/* Rank badge */}
      {rank && (
        <div
          className="absolute top-4 left-4 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: rank === 1 ? "var(--accent)" : "var(--bg-raised)",
            color: rank === 1 ? "white" : "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          {rank}
        </div>
      )}

      {/* Featured ring */}
      {tool.featured && !rank && (
        <div className="absolute top-4 left-4">
          <span className="badge badge-primary text-xs">Featured</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-10 h-10 object-contain"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${tool.name}&background=7c3aed&color=fff&size=80`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/tool/${tool.slug}`}
                className="font-display text-xl font-semibold hover:opacity-80 transition-opacity truncate"
                style={{ color: "var(--text-primary)", textDecoration: "none" }}
              >
                {tool.name}
              </Link>
              {tool.verified && (
                <Shield
                  size={14}
                  style={{
                    color: "var(--accent-green)",
                    fill: "var(--accent-green)",
                  }}
                />
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              by {tool.owner.name}
            </p>
          </div>
          <button
            onClick={e => {
              e.preventDefault();
              toggleSave(tool.id);
            }}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              color: saved ? "var(--primary-bright)" : "var(--text-muted)",
              background: saved ? "rgba(167,139,250,0.1)" : "transparent",
            }}
            title={saved ? "Remove from saved" : "Save tool"}
          >
            {saved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
          </button>
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {tool.tagline}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`badge ${pricingColor}`}>{tool.pricing}</span>
          <span className="badge">{tool.type}</span>
          {tool.hasApi && (
            <span
              className="badge"
              style={{
                color: "var(--accent-green)",
                borderColor: "rgba(16,185,129,0.2)",
              }}
            >
              <Zap size={10} /> API
            </span>
          )}
          {tool.isOpenSource && (
            <span className="badge-green badge">Open Source</span>
          )}
          {tool.contextWindow && (
            <span className="badge font-mono">{tool.contextWindow}</span>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star
                size={14}
                style={{ color: "var(--accent)", fill: "var(--accent)" }}
              />
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {tool.rating}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                ({tool.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Visit website"
            >
              <ExternalLink size={14} />
            </a>
            <Link
              href={`/tool/${tool.slug}`}
              className="btn-primary text-xs px-4 py-2"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
