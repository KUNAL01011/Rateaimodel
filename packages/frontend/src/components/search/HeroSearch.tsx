"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAIRecommendation } from "@/lib/hooks";
import Link from "next/link";

const SUGGESTIONS = [
  "best AI for coding in TypeScript",
  "free image generation with API",
  "autonomous agents for research",
  "voice cloning for podcasts",
  "video generation for marketing",
  "open source LLM I can self-host",
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [aiResults, setAiResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    recommendations,
    loading,
    error,
    reasoning,
    getRecommendations,
    reset: resetRecommendations,
  } = useAIRecommendation();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      if (mode === "ai") {
        setAiResults(true);
        getRecommendations(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    },
    [query, mode, router, getRecommendations]
  );

  const handleSuggestion = (s: string) => {
    setQuery(s);
    inputRef.current?.focus();
  };

  const handleNewSearch = () => {
    setAiResults(false);
    resetRecommendations();
    setQuery("");
  };

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode toggle */}
      <div
        className="flex items-center gap-1 mb-4 p-1 rounded-xl w-fit mx-auto"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {(
          [
            { key: "search", label: "Browse", icon: <Search size={12} /> },
            { key: "ai", label: "Ask AI", icon: <Sparkles size={12} /> },
          ] as const
        ).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background:
                mode === key
                  ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                  : "transparent",
              color: mode === key ? "white" : "var(--text-secondary)",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all`}
          style={{
            background: "var(--bg-card)",
            border: `1.5px solid ${focused ? "var(--primary)" : "var(--border-strong)"}`,
            boxShadow: focused ? "0 0 0 4px rgba(167,139,250,0.1)" : "none",
          }}
        >
          {mode === "ai" ? (
            <Sparkles
              size={18}
              style={{ color: "var(--primary)", flexShrink: 0 }}
            />
          ) : (
            <Search
              size={18}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              mode === "ai"
                ? 'Describe your task: "I need to generate product images with text overlays..."'
                : "Search AI tools, models, agents..."
            }
            className="flex-1 bg-transparent text-base outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5 shrink-0"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : mode === "ai" ? (
              <>
                <Sparkles size={14} /> Match
              </>
            ) : (
              <ArrowRight size={14} />
            )}
          </button>
        </div>
      </form>

      {/* Quick suggestions — only when no AI results shown */}
      {!aiResults && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* AI Results panel */}
      {aiResults && (
        <div
          className="mt-6 rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
          }}
        >
          {loading && (
            <div className="flex items-center gap-3 p-6">
              <Loader2
                size={18}
                className="animate-spin"
                style={{ color: "var(--primary)" }}
              />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Analyzing your requirements and matching tools...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-3 p-6">
              <AlertCircle size={18} style={{ color: "var(--accent-red)" }} />
              <p className="text-sm" style={{ color: "var(--accent-red)" }}>
                {error}
              </p>
            </div>
          )}

          {!loading && !error && recommendations.length > 0 && (
            <>
              <div
                className="px-5 py-4"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "rgba(167,139,250,0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} style={{ color: "var(--primary)" }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--primary-bright)" }}
                  >
                    AI Recommendation
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {reasoning}
                </p>
              </div>

              <div className="p-3 grid grid-cols-2 gap-2">
                {recommendations.map(({ tool, matchReason }) => (
                  <Link
                    key={tool.id}
                    href={`/tool/${tool.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      textDecoration: "none",
                    }}
                    title={matchReason}
                  >
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-8 h-8 rounded-lg object-contain"
                      style={{ background: "var(--bg-card)" }}
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=7c3aed&color=fff`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span style={{ color: "var(--accent)", fontSize: 10 }}>
                          ★
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {tool.rating > 0 ? tool.rating : "New"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-5 pb-4">
                <button
                  onClick={handleNewSearch}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← New search
                </button>
              </div>
            </>
          )}

          {!loading && !error && recommendations.length === 0 && (
            <div className="p-6 text-center">
              <p
                className="text-sm mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                No matching tools found. Try rephrasing your query.
              </p>
              <button
                onClick={handleNewSearch}
                className="text-xs"
                style={{ color: "var(--primary)" }}
              >
                ← Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
