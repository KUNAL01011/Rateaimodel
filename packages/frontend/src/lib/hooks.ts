"use client";
import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { AITool, SearchFilters, Review, Category } from "./types";
import {
  authApi,
  toolsApi,
  searchApi,
  categoriesApi,
  reviewsApi,
  savedApi,
  recommendApi,
  adminApi,
  BackendTool,
  BackendCategory,
  BackendReview,
  AuthUser as ApiAuthUser,
  CreateReviewPayload,
} from "./api";
import {
  signInWithGoogle as firebaseSignIn,
  signOutFromFirebase,
} from "./firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Generic async state
// ─────────────────────────────────────────────────────────────────────────────

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T;
  status: AsyncStatus;
  error: string | null;
}

type AsyncAction<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; payload: string }
  | { type: "RESET" };

function createAsyncReducer<T>(initialData: T) {
  return function asyncReducer(
    state: AsyncState<T>,
    action: AsyncAction<T>
  ): AsyncState<T> {
    switch (action.type) {
      case "LOADING":
        return { ...state, status: "loading", error: null };
      case "SUCCESS":
        return { data: action.payload, status: "success", error: null };
      case "ERROR":
        return { ...state, status: "error", error: action.payload };
      case "RESET":
        return { data: initialData, status: "idle", error: null };
      default:
        return state;
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapters: backend shape → frontend AITool shape
// ─────────────────────────────────────────────────────────────────────────────

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
      accuracy: (t as any).ratingAccuracy ?? 0,
      speed: (t as any).ratingSpeed ?? 0,
      costValue: (t as any).ratingCostValue ?? 0,
      easeOfUse: (t as any).ratingEaseOfUse ?? 0,
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
        score: String(b.score) + (b.scoreUnit ?? ""),
        vsAvg: "",
        positive: true,
      })) ?? [],
    reviews: [],
    featured: t.isFeatured,
    verified: false,
    website: t.websiteUrl ?? "#",
    usersCount: "",
  };
}

function adaptReview(r: BackendReview): Review {
  const user = r.userId as any;
  const displayName = user?.displayName ?? user?.username ?? "Anonymous";
  return {
    id: r._id,
    userId: user?._id ?? "",
    userName: displayName,
    userInitials: displayName.slice(0, 2).toUpperCase(),
    rating: r.ratingOverall,
    title: r.reviewText.slice(0, 80),
    body: r.reviewText,
    pros: r.pros
      ? r.pros
          .split(";")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [],
    cons: r.cons
      ? r.cons
          .split(";")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [],
    useCase: r.useCase,
    date: new Date(r.createdAt).toLocaleDateString(),
    helpful: r.upvotes,
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

// Maps frontend display labels → backend enum values
// Must match USE_CASES in packages/backend/src/models/enums.ts
export const USE_CASE_DISPLAY_TO_ENUM: Record<string, string> = {
  "Coding & Development": "coding_general",
  "Content Writing": "copywriting",
  "Research & Analysis": "academic_research",
  "Image/Video Creation": "image_generation",
  "Data Processing": "data_analysis",
  "Customer Support": "customer_support_bot",
  "Personal Productivity": "personal_assistant",
  Education: "study_and_learning",
  Marketing: "seo_content",
  Other: "brainstorming",
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth — module-level singleton so all consumers share state
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

type AuthState = AsyncState<AuthUser | null>;

let _authState: AuthState = { data: null, status: "idle", error: null };
const _authListeners = new Set<() => void>();

function setAuthState(state: AuthState) {
  _authState = state;
  _authListeners.forEach(fn => fn());
}

export function useAuth() {
  const [, rerender] = useReducer(x => x + 1, 0);

  useEffect(() => {
    _authListeners.add(rerender);
    return () => {
      _authListeners.delete(rerender);
    };
  }, []);

  useEffect(() => {
    if (_authState.status !== "idle") return;
    setAuthState({ ..._authState, status: "loading" });
    authApi
      .me()
      .then(u =>
        setAuthState({
          data: {
            id: u.id,
            name: u.displayName ?? u.username,
            email: u.email,
            avatar: u.avatarUrl ?? "",
            role: u.role,
          },
          status: "success",
          error: null,
        })
      )
      .catch(() =>
        setAuthState({ data: null, status: "success", error: null })
      );
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthState({ ..._authState, status: "loading", error: null });
    try {
      const idToken = await firebaseSignIn();
      const res = await authApi.googleLogin(idToken);
      setAuthState({
        data: {
          id: res.user.id,
          name: res.user.displayName ?? res.user.username,
          email: res.user.email,
          avatar: res.user.avatarUrl ?? "",
          role: res.user.role,
        },
        status: "success",
        error: null,
      });
    } catch (err: any) {
      setAuthState({
        ..._authState,
        status: "error",
        error: err?.message ?? "Sign-in failed",
      });
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await Promise.allSettled([authApi.logout(), signOutFromFirebase()]);
    setAuthState({ data: null, status: "success", error: null });
  }, []);

  return {
    user: _authState.data,
    loading: _authState.status === "loading",
    error: _authState.error,
    signInWithGoogle,
    signOut,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Saved Tools — module-level singleton to prevent N API calls per page
// ─────────────────────────────────────────────────────────────────────────────

type SavedState = {
  ids: Set<string>;
  status: "idle" | "loading" | "ready";
  error: string | null;
};

let _savedState: SavedState = { ids: new Set(), status: "idle", error: null };
const _savedListeners = new Set<() => void>();
const _pendingToggles = new Set<string>();

function setSavedState(state: SavedState) {
  _savedState = state;
  _savedListeners.forEach(fn => fn());
}

// Initialise saved state once when a user is available
async function initSaved() {
  if (_savedState.status !== "idle") return;
  setSavedState({ ..._savedState, status: "loading" });
  try {
    const tools = await savedApi.getAll();
    const ids = new Set<string>(tools.map((t: any) => t._id ?? t.id));
    setSavedState({ ids, status: "ready", error: null });
  } catch (err: any) {
    setSavedState({
      ..._savedState,
      status: "idle", // allow retry
      error: err?.message ?? "Failed to load saved tools",
    });
  }
}

export function useSavedTools() {
  const { user } = useAuth();
  const [, rerender] = useReducer(x => x + 1, 0);

  useEffect(() => {
    _savedListeners.add(rerender);
    return () => {
      _savedListeners.delete(rerender);
    };
  }, []);

  // Kick off load once when user becomes available
  useEffect(() => {
    if (!user) {
      // Reset when user logs out
      if (_savedState.status !== "idle") {
        setSavedState({ ids: new Set(), status: "idle", error: null });
      }
      return;
    }
    initSaved();
  }, [user]);

  const toggleSave = useCallback(
    async (toolId: string) => {
      if (!user) return;
      if (_pendingToggles.has(toolId)) return;
      _pendingToggles.add(toolId);

      // Optimistic update
      const next = new Set(_savedState.ids);
      const wasIn = next.has(toolId);
      if (wasIn) next.delete(toolId);
      else next.add(toolId);
      setSavedState({ ..._savedState, ids: next });

      try {
        const res = await savedApi.toggle(toolId);
        const reconciled = new Set(_savedState.ids);
        if (res.saved) reconciled.add(toolId);
        else reconciled.delete(toolId);
        setSavedState({ ..._savedState, ids: reconciled });
      } catch (err: any) {
        // Revert
        const reverted = new Set(_savedState.ids);
        if (wasIn) reverted.add(toolId);
        else reverted.delete(toolId);
        setSavedState({
          ..._savedState,
          ids: reverted,
          error: err?.message ?? "Failed to update saved tools",
        });
      } finally {
        _pendingToggles.delete(toolId);
      }
    },
    [user]
  );

  const isSaved = useCallback(
    (toolId: string) => _savedState.ids.has(toolId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_savedState.ids]
  );

  return {
    savedIds: _savedState.ids,
    toggleSave,
    isSaved,
    loading: _savedState.status === "loading",
    error: _savedState.error,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tools
// ─────────────────────────────────────────────────────────────────────────────

export function useTools(params?: Record<string, string | number | undefined>) {
  const [state, dispatch] = useReducer(createAsyncReducer<AITool[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    toolsApi
      .getAll({ limit: 50, ...params })
      .then(res => {
        if (!cancelled)
          dispatch({ type: "SUCCESS", payload: res.data.map(adaptTool) });
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load tools",
          });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tools: state.data,
    loading: state.status === "loading",
    error: state.error,
    status: state.status,
  };
}

export function useTool(slug: string) {
  const [state, dispatch] = useReducer(
    createAsyncReducer<AITool | null>(null),
    {
      data: null,
      status: "idle",
      error: null,
    }
  );

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    dispatch({ type: "LOADING" });
    toolsApi
      .getBySlug(slug)
      .then(t => {
        if (!cancelled) dispatch({ type: "SUCCESS", payload: adaptTool(t) });
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Tool not found",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    tool: state.data,
    loading: state.status === "loading",
    error: state.error,
    status: state.status,
  };
}

export function useFeaturedTools(limit = 6) {
  const [state, dispatch] = useReducer(createAsyncReducer<AITool[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    toolsApi
      .getFeatured(limit)
      .then(data => {
        if (!cancelled)
          dispatch({ type: "SUCCESS", payload: data.map(adaptTool) });
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load featured tools",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return {
    tools: state.data,
    loading: state.status === "loading",
    error: state.error,
  };
}

export function useTrendingTools(limit = 6) {
  const [state, dispatch] = useReducer(createAsyncReducer<AITool[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    toolsApi
      .getTrending(limit)
      .then(data => {
        if (!cancelled)
          dispatch({ type: "SUCCESS", payload: data.map(adaptTool) });
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load trending tools",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return {
    tools: state.data,
    loading: state.status === "loading",
    error: state.error,
  };
}

export function useSimilarTools(slug: string, limit = 5) {
  const [state, dispatch] = useReducer(createAsyncReducer<AITool[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    dispatch({ type: "LOADING" });
    toolsApi
      .getSimilar(slug, limit)
      .then(data => {
        if (!cancelled)
          dispatch({ type: "SUCCESS", payload: data.map(adaptTool) });
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load similar tools",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, limit]);

  return {
    tools: state.data,
    loading: state.status === "loading",
    error: state.error,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────────────────────

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [state, dispatch] = useReducer(createAsyncReducer<AITool[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });
  const [appliedFilters, setAppliedFilters] = useState<Partial<SearchFilters>>(
    {}
  );
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    (q: string, filters?: Partial<SearchFilters>, page = 1, limit = 20) => {
      setQuery(q);
      if (filters) setAppliedFilters(filters);

      if (!q.trim()) {
        dispatch({ type: "SUCCESS", payload: [] });
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      dispatch({ type: "LOADING" });
      searchApi
        .search(q, page, limit)
        .then(res => {
          let list = res.data.map(adaptTool);
          const f = filters ?? appliedFilters;
          if (f.types?.length)
            list = list.filter(t => f.types!.includes(t.type));
          if (f.pricing?.length)
            list = list.filter(t => f.pricing!.includes(t.pricing));
          if (f.hasApi != null) list = list.filter(t => t.hasApi === f.hasApi);
          if (f.isOpenSource != null)
            list = list.filter(t => t.isOpenSource === f.isOpenSource);
          if (f.minRating != null)
            list = list.filter(t => t.rating >= (f.minRating ?? 0));
          dispatch({ type: "SUCCESS", payload: list });
        })
        .catch((err: any) => {
          if (err?.name === "AbortError") return;
          dispatch({ type: "ERROR", payload: err?.message ?? "Search failed" });
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    query,
    results: state.data,
    loading: state.status === "loading",
    error: state.error,
    status: state.status,
    filters: appliedFilters,
    setFilters: setAppliedFilters,
    search,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────────────────

export function useCategory(slug: string) {
  const [state, dispatch] = useReducer(
    createAsyncReducer<Category | null>(null),
    {
      data: null,
      status: "idle",
      error: null,
    }
  );

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    dispatch({ type: "LOADING" });
    categoriesApi
      .getBySlug(slug)
      .then(c => {
        if (!cancelled) {
          const mapped: Category = {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.icon,
            count: c.count,
            featured: [],
          };
          dispatch({ type: "SUCCESS", payload: mapped });
        }
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load category",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    category: state.data,
    loading: state.status === "loading",
    error: state.error,
    status: state.status,
  };
}

export function useCategories() {
  const [state, dispatch] = useReducer(createAsyncReducer<Category[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    categoriesApi
      .getAll()
      .then(data => {
        if (!cancelled) {
          const mapped: Category[] = data.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.icon,
            count: c.count,
            featured: [],
          }));
          dispatch({ type: "SUCCESS", payload: mapped });
        }
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load categories",
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    categories: state.data,
    loading: state.status === "loading",
    error: state.error,
    status: state.status,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews — fetched from API
// ─────────────────────────────────────────────────────────────────────────────

export function useReviews(toolId: string, page = 1, limit = 20) {
  const [state, dispatch] = useReducer(createAsyncReducer<Review[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!toolId) return;
    let cancelled = false;
    dispatch({ type: "LOADING" });
    reviewsApi
      .getByTool(toolId, { page, limit })
      .then(res => {
        if (!cancelled) {
          dispatch({ type: "SUCCESS", payload: res.data.map(adaptReview) });
          setTotalPages(res.meta.totalPages);
        }
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load reviews",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [toolId, page, limit]);

  return {
    reviews: state.data,
    loading: state.status === "loading",
    error: state.error,
    totalPages,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Submit Review
// ─────────────────────────────────────────────────────────────────────────────

interface SubmitReviewInput {
  toolId: string;
  rating: number;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  useCase: string; // frontend display label — gets mapped to enum
  ratingBreakdown: {
    accuracy: number;
    speed: number;
    costValue: number;
    easeOfUse: number;
  };
  wouldRecommend?: boolean;
}

export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitReview = useCallback(async (data: SubmitReviewInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Map display label → backend enum value
      const useCaseEnum =
        USE_CASE_DISPLAY_TO_ENUM[data.useCase] ?? "brainstorming";

      const payload: CreateReviewPayload = {
        toolId: data.toolId,
        useCase: useCaseEnum,
        ratingOverall: data.rating,
        ratingAccuracy: data.ratingBreakdown.accuracy || undefined,
        ratingSpeed: data.ratingBreakdown.speed || undefined,
        ratingCostValue: data.ratingBreakdown.costValue || undefined,
        ratingEaseOfUse: data.ratingBreakdown.easeOfUse || undefined,
        reviewText: data.body,
        pros: data.pros.filter(Boolean).join("; ") || undefined,
        cons: data.cons.filter(Boolean).join("; ") || undefined,
        wouldRecommend: data.wouldRecommend ?? data.rating >= 3,
      };
      await reviewsApi.create(payload);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.message ?? "Failed to submit review";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return { submitReview, loading, error, success, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpful vote
// ─────────────────────────────────────────────────────────────────────────────

export function useHelpfulVote() {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const voteHelpful = useCallback(
    async (reviewId: string) => {
      if (votedIds.has(reviewId)) return;
      setVotedIds(prev => new Set(prev).add(reviewId));
      try {
        await reviewsApi.vote(reviewId, "up");
      } catch {
        setVotedIds(prev => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      }
    },
    [votedIds]
  );

  return { voteHelpful, votedIds };
}

// ─────────────────────────────────────────────────────────────────────────────
// List / Submit a Tool
// ─────────────────────────────────────────────────────────────────────────────

export function useListTool() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTool = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v == null) return;
        if (Array.isArray(v)) formData.append(k, v.join(","));
        else formData.append(k, String(v));
      });
      const res = await toolsApi.submit(formData);
      if (res.success === false)
        throw new Error(res.message ?? "Submission rejected");
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.message ?? "Submission failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  return { submitTool, loading, success, error, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Recommendation
// ─────────────────────────────────────────────────────────────────────────────

interface RecommendationResult {
  tool: AITool;
  score: number;
  matchReason: string;
}

export function useAIRecommendation() {
  const [state, dispatch] = useReducer(
    createAsyncReducer<RecommendationResult[]>([]),
    { data: [], status: "idle", error: null }
  );
  const [reasoning, setReasoning] = useState("");

  const getRecommendations = useCallback(
    async (prompt: string, filters?: object, limit = 8) => {
      if (!prompt.trim()) return;
      dispatch({ type: "LOADING" });
      setReasoning("");
      try {
        const res = await recommendApi.recommend(prompt, filters, limit);
        const results: RecommendationResult[] = res.recommendations.map(r => ({
          tool: adaptTool(r.tool),
          score: r.score,
          matchReason: r.matchReason,
        }));
        dispatch({ type: "SUCCESS", payload: results });
        const intentTask = (res.intent as any)?.task_type ?? "your use case";
        setReasoning(
          `Matched tools for "${prompt}" using ${intentTask} intent. Ranked by community rating and use-case fit.`
        );
      } catch (err: any) {
        dispatch({
          type: "ERROR",
          payload: err?.message ?? "Recommendation failed",
        });
        setReasoning("");
      }
    },
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    setReasoning("");
  }, []);

  return {
    recommendations: state.data,
    loading: state.status === "loading",
    error: state.error,
    status: state.status,
    reasoning,
    getRecommendations,
    reset,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin hooks — use imported adminApi, not require()
// ─────────────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const [state, dispatch] = useReducer(
    createAsyncReducer<{
      totalUsers: number;
      roleBreakdown: Record<string, number>;
      totalTools: number;
      totalReviews: number;
      pendingSubmissions: number;
    } | null>(null),
    { data: null, status: "idle", error: null }
  );

  useEffect(() => {
    dispatch({ type: "LOADING" });
    adminApi
      .stats()
      .then((data: any) => dispatch({ type: "SUCCESS", payload: data }))
      .catch((err: any) =>
        dispatch({
          type: "ERROR",
          payload: err?.message ?? "Failed to load stats",
        })
      );
  }, []);

  return {
    stats: state.data,
    loading: state.status === "loading",
    error: state.error,
  };
}

export function useAdminSubmissions(page = 1, limit = 20) {
  const [state, dispatch] = useReducer(createAsyncReducer<any[]>([]), {
    data: [],
    status: "idle",
    error: null,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    adminApi
      .getSubmissions({ page, limit })
      .then((res: any) => {
        if (!cancelled) {
          dispatch({ type: "SUCCESS", payload: res.data });
          setTotalPages(res.meta.totalPages);
        }
      })
      .catch((err: any) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            payload: err?.message ?? "Failed to load submissions",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  const reviewSubmission = useCallback(
    async (
      id: string,
      action: "approve" | "reject",
      adminNote?: string,
      toolData?: object
    ) => {
      await adminApi.reviewSubmission(id, { action, adminNote, toolData });
    },
    []
  );

  return {
    submissions: state.data,
    loading: state.status === "loading",
    error: state.error,
    totalPages,
    reviewSubmission,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination helper
// ─────────────────────────────────────────────────────────────────────────────

export function usePagination(totalPages: number, initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const goTo = useCallback(
    (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
    [totalPages]
  );
  const next = useCallback(() => goTo(page + 1), [goTo, page]);
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  return {
    page,
    goTo,
    next,
    prev,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Debounce
// ─────────────────────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
