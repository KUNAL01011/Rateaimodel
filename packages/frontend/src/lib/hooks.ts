"use client";
import { useState, useEffect, useCallback } from "react";
import { AITool, SearchFilters, Review } from "./types";
import { MOCK_TOOLS, MOCK_CATEGORIES, searchTools } from "./mockData";

// ─── Tools ───────────────────────────────────────────────────────────────────

export function useTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: GET /api/tools
    const timer = setTimeout(() => {
      setTools(MOCK_TOOLS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
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
    // TODO: GET /api/tools/:slug
    const timer = setTimeout(() => {
      const found = MOCK_TOOLS.find(t => t.slug === slug);
      if (found) setTool(found);
      else setError("Tool not found");
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  return { tool, loading, error };
}

export function useFeaturedTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: GET /api/tools/featured
    const timer = setTimeout(() => {
      setTools(MOCK_TOOLS.filter(t => t.featured));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return { tools, loading };
}

export function useTrendingTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: GET /api/tools/trending
    const timer = setTimeout(() => {
      setTools(MOCK_TOOLS.filter(t => t.trending));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return { tools, loading };
}

// ─── Search & Filters ────────────────────────────────────────────────────────

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Partial<SearchFilters>>({});

  const search = useCallback((q: string, f?: Partial<SearchFilters>) => {
    setQuery(q);
    if (f) setFilters(f);
    setLoading(true);
    // TODO: GET /api/search?q=:query&filters=...
    setTimeout(() => {
      let results = q ? searchTools(q) : MOCK_TOOLS;
      if (f?.types?.length)
        results = results.filter(t => f.types!.includes(t.type));
      if (f?.pricing?.length)
        results = results.filter(t => f.pricing!.includes(t.pricing));
      if (f?.hasApi !== null && f?.hasApi !== undefined)
        results = results.filter(t => t.hasApi === f.hasApi);
      if (f?.isOpenSource !== null && f?.isOpenSource !== undefined)
        results = results.filter(t => t.isOpenSource === f.isOpenSource);
      if (f?.minRating) results = results.filter(t => t.rating >= f.minRating!);
      setResults(results);
      setLoading(false);
    }, 300);
  }, []);

  return { query, results, loading, filters, setFilters, search };
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: GET /api/categories
    const timer = setTimeout(() => {
      setCategories(MOCK_CATEGORIES);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return { categories, loading };
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useReviews(toolId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!toolId) return;
    // TODO: GET /api/tools/:toolId/reviews
    const timer = setTimeout(() => {
      const tool = MOCK_TOOLS.find(t => t.id === toolId);
      setReviews(tool?.reviews ?? []);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
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
    // TODO: POST /api/reviews { ...data, userId: session.user.id }
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log("Review submitted:", data);
        setSuccess(true);
        setLoading(false);
        resolve();
      }, 1500);
    });
  };

  return { submitReview, loading, error, success };
}

export function useHelpfulVote() {
  const voteHelpful = async (reviewId: string) => {
    // TODO: POST /api/reviews/:reviewId/helpful
    console.log("Voted helpful:", reviewId);
  };
  return { voteHelpful };
}

// ─── Save / Bookmarks ────────────────────────────────────────────────────────

export function useSavedTools() {
  const [saved, setSaved] = useState<string[]>([]);

  const toggleSave = async (toolId: string) => {
    // TODO: POST /api/user/saved { toolId }
    setSaved(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const isSaved = (toolId: string) => saved.includes(toolId);

  return { saved, toggleSave, isSaved };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    // TODO: NextAuth signIn('google') or Supabase OAuth
    setTimeout(() => {
      setUser({
        id: "u-demo",
        name: "Kunal Kumar",
        email: "kunal@example.com",
        avatar: "",
      });
      setLoading(false);
    }, 1200);
  };

  const signOut = async () => {
    // TODO: NextAuth signOut() or Supabase signOut()
    setUser(null);
  };

  return { user, loading, signInWithGoogle, signOut };
}

// ─── List Your Model ─────────────────────────────────────────────────────────

export function useListTool() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTool = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    // TODO: POST /api/tools/submit { ...data } — requires auth, goes to moderation queue
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log("Tool submitted for review:", data);
        setSuccess(true);
        setLoading(false);
        resolve();
      }, 2000);
    });
  };

  return { submitTool, loading, success, error };
}

// ─── AI Recommendation ───────────────────────────────────────────────────────

export function useAIRecommendation() {
  const [recommendations, setRecommendations] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState("");

  const getRecommendations = async (prompt: string) => {
    setLoading(true);
    setRecommendations([]);
    // TODO: POST /api/recommend { prompt } — calls Claude API to match tools
    setTimeout(() => {
      const q = prompt.toLowerCase();
      let recs = MOCK_TOOLS.filter(
        t =>
          t.tags.some(tag => q.includes(tag)) ||
          t.category.toLowerCase().includes(q)
      ).slice(0, 4);
      if (!recs.length) recs = MOCK_TOOLS.slice(0, 4);
      setRecommendations(recs);
      setReasoning(
        `Based on your request for "${prompt}", I've matched tools that excel in those areas based on community ratings, benchmark data, and use-case alignment.`
      );
      setLoading(false);
    }, 1800);
  };

  return { recommendations, loading, reasoning, getRecommendations };
}
