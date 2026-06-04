"use client";
import { useState, useEffect, useCallback } from "react";
import { AITool, SearchFilters, Review } from "./types";
import { MOCK_TOOLS, MOCK_CATEGORIES, searchTools } from "./mockData";
import {
  authApi,
  toolsApi,
  searchApi,
  categoriesApi,
  reviewsApi,
  savedApi,
  recommendApi,
  BackendTool,
  BackendCategory,
  BackendReview,
  AuthUser,
} from "./api";
import {
  signInWithGoogle as firebaseSignIn,
  signOutFromFirebase,
} from "./firebase";

// ── Adapters: backend shape → frontend AITool shape ───────────────────
function adaptTool(t: BackendTool): AITool {
  return {
    id: t._id,
    slug: t.slug,
    name: t.name,
    tagline: t.shortDescription,
    description: t.fullDescription ?? t.shortDescription,
    logo:
      t.logoUrl ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=7c3aed&color=fff`,
    owner: {
      id: t.providerId?.slug ?? "unknown",
      name: t.providerId?.name ?? "Unknown Provider",
      logo: t.providerId?.logoUrl ?? "",
      website: t.websiteUrl ?? "#",
      founded: "",
      hq: "",
      description: "",
      employees: "",
      fundingStage: "",
      totalFunding: "",
      verified: false,
    },
    type: mapToolType(t.toolType),
    category: mapToolType(t.toolType),
    tags: t.useCaseCoverage?.slice(0, 5).map(u => u.useCase) ?? [],
    pricing: mapPricingType(t.pricingType),
    pricingDetails: "",
    rating: t.ratingOverall ?? 0,
    reviewCount: t.reviewsCount ?? 0,
    ratingBreakdown: {
      accuracy: 0,
      speed: 0,
      costValue: 0,
      easeOfUse: 0,
      reliability: 0,
    },
    modalities: [],
    hasApi: t.hasApi,
    isOpenSource: t.isOpenSource,
    contextWindow: t.contextWindowTokens
      ? `${(t.contextWindowTokens / 1000).toFixed(0)}K tokens`
      : undefined,
    launchDate: "",
    lastUpdated: "",
    benchmarks:
      t.benchmarks?.map(b => ({
        name: b.benchmarkName,
        score: String(b.score) + (b.scoreUnit ? b.scoreUnit : ""),
        vsAvg: "",
        positive: true,
      })) ?? [],
    reviews: [],
    featured: t.isFeatured,
    verified: false,
    website: t.websiteUrl ?? "#",
  };
}

function mapToolType(t: string): any {
  const map: Record<string, string> = {
    llm_model: "LLM",
    chat_product: "Bot",
    search_product: "Agent",
    coding_tool: "Code",
    image_model: "Image",
    video_model: "Video",
    audio_model: "Audio",
    embedding_model: "LLM",
    agent_framework: "Agent",
    multimodal_tool: "Multimodal",
    open_source_model: "LLM",
  };
  return map[t] ?? "LLM";
}

function mapPricingType(t: string): any {
  const map: Record<string, string> = {
    free: "Free",
    open_source_free: "Open Source",
    freemium: "Freemium",
    subscription: "Paid",
    pay_per_token: "Paid",
    pay_per_use: "Paid",
    enterprise: "Enterprise",
  };
  return map[t] ?? "Freemium";
}

// ── Tools ───────────────────────────────────────────────────────────────
export function useTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    toolsApi
      .getAll({ limit: 50 })
      .then(res => setTools(res.data.map(adaptTool)))
      .catch(() => setTools(MOCK_TOOLS))
      .finally(() => setLoading(false));
  }, []);

  return { tools, loading, error };
}

export function useTool(slug: string) {
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    toolsApi
      .getBySlug(slug)
      .then(t => setTool(adaptTool(t)))
      .catch(() => {
        const found = MOCK_TOOLS.find(t => t.slug === slug);
        if (found) setTool(found);
        else setError("Tool not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return { tool, loading, error };
}

export function useFeaturedTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    toolsApi
      .getFeatured()
      .then(data => setTools(data.map(adaptTool)))
      .catch(() => setTools(MOCK_TOOLS.filter(t => t.featured)))
      .finally(() => setLoading(false));
  }, []);

  return { tools, loading };
}

export function useTrendingTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    toolsApi
      .getTrending()
      .then(data => setTools(data.map(adaptTool)))
      .catch(() => setTools(MOCK_TOOLS.filter(t => t.trending)))
      .finally(() => setLoading(false));
  }, []);

  return { tools, loading };
}

// ── Search ────────────────────────────────────────────────────────────
export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Partial<SearchFilters>>({});

  const search = useCallback((q: string, f?: Partial<SearchFilters>) => {
    setQuery(q);
    if (f) setFilters(f);
    setLoading(true);

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    searchApi
      .search(q)
      .then(res => {
        let list = res.data.map(adaptTool);
        // Apply client-side filters on top
        if (f?.types?.length)
          list = list.filter(t => f.types!.includes(t.type));
        if (f?.hasApi != null) list = list.filter(t => t.hasApi === f.hasApi);
        if (f?.isOpenSource != null)
          list = list.filter(t => t.isOpenSource === f.isOpenSource);
        setResults(list);
      })
      .catch(() => {
        let fallback = q ? searchTools(q) : MOCK_TOOLS;
        if (f?.types?.length)
          fallback = fallback.filter(t => f.types!.includes(t.type));
        setResults(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  return { query, results, loading, filters, setFilters, search };
}

// ── Categories ───────────────────────────────────────────────────────
export function useCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then(data => {
        // Map to frontend Category shape
        const mapped = data.map((c, i) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          count: c.count,
          featured: [],
        }));
        setCategories(mapped as any);
      })
      .catch(() => {
        /* keep MOCK_CATEGORIES */
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

// ── Reviews ──────────────────────────────────────────────────────────
export function useReviews(toolId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!toolId) return;
    reviewsApi
      .getByTool(toolId)
      .then(res => {
        const mapped: Review[] = res.data.map(r => ({
          id: r._id,
          userId: (r.userId as any)?._id ?? "",
          userName:
            (r.userId as any)?.displayName ??
            (r.userId as any)?.username ??
            "User",
          userInitials: (
            (r.userId as any)?.displayName ??
            (r.userId as any)?.username ??
            "U"
          )
            .slice(0, 2)
            .toUpperCase(),
          rating: r.ratingOverall,
          title: r.reviewText.slice(0, 80),
          body: r.reviewText,
          pros: r.pros ? [r.pros] : [],
          cons: r.cons ? [r.cons] : [],
          useCase: r.useCase,
          date: new Date(r.createdAt).toLocaleDateString(),
          helpful: r.upvotes,
        }));
        setReviews(mapped);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [toolId]);

  return { reviews, loading };
}

export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitReview = async (data: {
    toolId: string;
    rating: number;
    title: string;
    body: string;
    pros: string[];
    cons: string[];
    useCase: string;
    ratingBreakdown: {
      accuracy: number;
      speed: number;
      costValue: number;
      easeOfUse: number;
    };
  }) => {
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.create({
        toolId: data.toolId,
        useCase: data.useCase,
        ratingOverall: data.rating,
        ratingAccuracy: data.ratingBreakdown.accuracy || undefined,
        ratingSpeed: data.ratingBreakdown.speed || undefined,
        ratingCostValue: data.ratingBreakdown.costValue || undefined,
        ratingEaseOfUse: data.ratingBreakdown.easeOfUse || undefined,
        reviewText: data.body,
        pros: data.pros.filter(Boolean).join("; "),
        cons: data.cons.filter(Boolean).join("; "),
        wouldRecommend: data.rating >= 3,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return { submitReview, loading, error, success };
}

export function useHelpfulVote() {
  const voteHelpful = async (reviewId: string) => {
    await reviewsApi.vote(reviewId, "up").catch(() => {});
  };
  return { voteHelpful };
}

// ── Saved Tools ──────────────────────────────────────────────────────
export function useSavedTools() {
  const [saved, setSaved] = useState<string[]>([]);

  // Load saved tools for logged-in user
  useEffect(() => {
    savedApi
      .getAll()
      .then(tools => setSaved(tools.map((t: any) => t._id ?? t.id)))
      .catch(() => {
        /* not logged in or error */
      });
  }, []);

  const toggleSave = async (toolId: string) => {
    try {
      const res = await savedApi.toggle(toolId);
      setSaved(prev =>
        res.saved ? [...prev, toolId] : prev.filter(id => id !== toolId)
      );
    } catch {
      // Optimistic fallback
      setSaved(prev =>
        prev.includes(toolId)
          ? prev.filter(id => id !== toolId)
          : [...prev, toolId]
      );
    }
  };

  const isSaved = (toolId: string) => saved.includes(toolId);

  return { saved, toggleSave, isSaved };
}

// ── Auth ─────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Re-hydrate from cookie/session on mount
  useEffect(() => {
    authApi
      .me()
      .then(u =>
        setUser({
          id: u.id,
          name: u.displayName ?? u.username,
          email: u.email,
          avatar: u.avatarUrl ?? "",
          role: u.role,
        })
      )
      .catch(() => {
        /* Not logged in */
      });
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const idToken = await firebaseSignIn();
      const res = await authApi.googleLogin(idToken);
      setUser({
        id: res.user.id,
        name: res.user.displayName ?? res.user.username,
        email: res.user.email,
        avatar: res.user.avatarUrl ?? "",
        role: res.user.role,
      });
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await Promise.all([
      authApi.logout().catch(() => {}),
      signOutFromFirebase().catch(() => {}),
    ]);
    setUser(null);
  };

  return { user, loading, signInWithGoogle, signOut };
}

// ── List Your Model ──────────────────────────────────────────────────
export function useListTool() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTool = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) formData.append(k, v.join(","));
          else formData.append(k, String(v));
        }
      });
      const res = await toolsApi.submit(formData);
      if (res.success === false) throw new Error(res.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return { submitTool, loading, success, error };
}

// ── AI Recommendation ────────────────────────────────────────────────
export function useAIRecommendation() {
  const [recommendations, setRecommendations] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState("");

  const getRecommendations = async (prompt: string) => {
    setLoading(true);
    setRecommendations([]);
    try {
      const res = await recommendApi.recommend(prompt, {}, 4);
      setRecommendations(res.recommendations.map(r => adaptTool(r.tool)));
      setReasoning(
        `Based on your request, I matched tools using ${(res.intent as any)?.task_type ?? "your use case"} intent. Results sorted by community rating and use-case fit.`
      );
    } catch {
      // Fallback to mock
      const q = prompt.toLowerCase();
      let recs = MOCK_TOOLS.filter(
        t =>
          t.tags.some(tag => q.includes(tag)) ||
          t.category.toLowerCase().includes(q)
      ).slice(0, 4);
      if (!recs.length) recs = MOCK_TOOLS.slice(0, 4);
      setRecommendations(recs);
      setReasoning(
        `Matched tools based on "${prompt}" using keyword analysis.`
      );
    } finally {
      setLoading(false);
    }
  };

  return { recommendations, loading, reasoning, getRecommendations };
}
