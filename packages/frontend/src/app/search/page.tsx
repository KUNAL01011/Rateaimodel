"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/lib/hooks";
import ToolCard from "@/components/tools/ToolCard";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ToolType, PricingModel } from "@/lib/types";

const TOOL_TYPES: ToolType[] = [
  "LLM",
  "Image",
  "Video",
  "Audio",
  "Code",
  "Agent",
  "Bot",
  "Automation",
  "Analytics",
];
const PRICING: PricingModel[] = [
  "Free",
  "Freemium",
  "Paid",
  "Enterprise",
  "Open Source",
];
const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Reviews" },
  { value: "trending", label: "Trending" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { query, results, loading, search } = useSearch(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<ToolType[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel[]>([]);
  const [hasApi, setHasApi] = useState<boolean | null>(null);
  const [isOss, setIsOss] = useState<boolean | null>(null);
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    search(initialQuery, {
      types: selectedTypes,
      pricing: selectedPricing,
      hasApi,
      isOpenSource: isOss,
    });
  }, [initialQuery]);

  const applyFilters = () => {
    search(inputVal, {
      types: selectedTypes,
      pricing: selectedPricing,
      hasApi,
      isOpenSource: isOss,
    });
  };

  const toggleType = (t: ToolType) => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const togglePricing = (p: PricingModel) => {
    setSelectedPricing(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedPricing([]);
    setHasApi(null);
    setIsOss(null);
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedPricing.length +
    (hasApi !== null ? 1 : 0) +
    (isOss !== null ? 1 : 0);

  const sortedResults = [...results].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "popular") return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div
        className="px-6 py-8"
        style={{
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 max-w-2xl">
            <div
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <Search
                size={16}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              />
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyFilters()}
                placeholder="Search AI tools, models, agents..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--text-primary)" }}
              />
              {inputVal && (
                <button
                  onClick={() => {
                    setInputVal("");
                    search("", {});
                  }}
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={applyFilters}
              className="btn-primary px-5 py-3 text-sm"
            >
              Search
            </button>
          </div>
          {query && (
            <h1
              className="mt-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  Showing{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    {results.length}
                  </strong>{" "}
                  results
                  {query && (
                    <>
                      {" "}
                      for{" "}
                      <strong style={{ color: "var(--primary-bright)" }}>
                        "{query}"
                      </strong>
                    </>
                  )}
                </>
              )}
            </h1>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside
          className={`shrink-0 transition-all ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}
        >
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Filters{" "}
                {activeFilterCount > 0 && (
                  <span className="badge badge-primary ml-2">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs"
                  style={{ color: "var(--primary)" }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Tool Type */}
            <div className="mb-6">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Tool Type
              </p>
              <div className="space-y-2">
                {TOOL_TYPES.map(t => (
                  <label
                    key={t}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(t)}
                      onChange={() => toggleType(t)}
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: selectedTypes.includes(t)
                          ? "var(--primary-bright)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Pricing
              </p>
              <div className="space-y-2">
                {PRICING.map(p => (
                  <label
                    key={p}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPricing.includes(p)}
                      onChange={() => togglePricing(p)}
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: selectedPricing.includes(p)
                          ? "var(--primary-bright)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {p}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Features
              </p>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Has Public API
                  </span>
                  <button
                    onClick={() => setHasApi(hasApi === true ? null : true)}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{
                      background:
                        hasApi === true
                          ? "var(--primary)"
                          : "var(--bg-card-hover)",
                    }}
                  >
                    <span
                      className="absolute top-0.5 transition-transform rounded-full w-4 h-4 bg-white"
                      style={{
                        transform:
                          hasApi === true
                            ? "translateX(22px)"
                            : "translateX(2px)",
                      }}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Open Source
                  </span>
                  <button
                    onClick={() => setIsOss(isOss === true ? null : true)}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{
                      background:
                        isOss === true
                          ? "var(--primary)"
                          : "var(--bg-card-hover)",
                    }}
                  >
                    <span
                      className="absolute top-0.5 transition-transform rounded-full w-4 h-4 bg-white"
                      style={{
                        transform:
                          isOss === true
                            ? "translateX(22px)"
                            : "translateX(2px)",
                      }}
                    />
                  </button>
                </label>
              </div>
            </div>

            <button
              onClick={applyFilters}
              className="btn-primary w-full text-sm py-2.5"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--text-secondary)" }}
            >
              <SlidersHorizontal size={14} />
              {sidebarOpen ? "Hide filters" : "Show filters"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Sort:
              </span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-xs py-1.5 pl-3 pr-8 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card h-56 shimmer" />
              ))}
            </div>
          ) : sortedResults.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3
                className="font-display text-xl mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No tools found
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sortedResults.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading...
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
