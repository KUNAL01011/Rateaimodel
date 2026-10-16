// packages/frontend/src/lib/api.ts
// Typed API client — mirrors the backend routes exactly

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }

  return json.data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  googleLogin: (idToken: string) =>
    req<{ accessToken: string; user: AuthUser; isNewUser: boolean }>(
      "/auth/google",
      {
        method: "POST",
        body: JSON.stringify({ idToken }),
      }
    ),
  logout: () => req("/auth/logout", { method: "POST" }),
  me: () => req<AuthUser>("/auth/me"),
};

// ── Tools ─────────────────────────────────────────────────────────────
export const toolsApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    req<PaginatedResponse<BackendTool>>(`/tools?${buildQuery(params)}`),
  getBySlug: (slug: string) => req<BackendTool>(`/tools/${slug}`),
  getFeatured: (limit = 10) =>
    req<BackendTool[]>(`/tools/featured?limit=${limit}`),
  getTrending: (limit = 10) =>
    req<BackendTool[]>(`/tools/trending?limit=${limit}`),
  getSimilar: (slug: string, limit = 5) =>
    req<BackendTool[]>(`/tools/${slug}/similar?limit=${limit}`),
  submit: (formData: FormData) =>
    fetch(`${BASE}/tools/submit`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then(r => r.json()),
};

// ── Search ────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string, page = 1, limit = 20) =>
    req<PaginatedResponse<BackendTool>>(
      `/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
    ),
};

// ── Categories ────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => req<BackendCategory[]>("/categories"),
  getBySlug: (slug: string) => req<BackendCategory>(`/categories/${slug}`),
};

// ── Reviews ───────────────────────────────────────────────────────────
export const reviewsApi = {
  getByTool: (toolId: string, params?: Record<string, string | number>) =>
    req<PaginatedResponse<BackendReview>>(
      `/reviews/tool/${toolId}?${buildQuery(params)}`
    ),
  create: (data: CreateReviewPayload) =>
    req<BackendReview>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  vote: (id: string, voteType: "up" | "down") =>
    req<BackendReview>(`/reviews/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ voteType }),
    }),
  delete: (id: string) => req(`/reviews/${id}`, { method: "DELETE" }),
};

// ── Saved tools ───────────────────────────────────────────────────────
export const savedApi = {
  getAll: () => req<BackendTool[]>("/users/me/saved"),
  toggle: (toolId: string) =>
    req<{ saved: boolean }>(`/users/me/saved/${toolId}`, { method: "POST" }),
  check: (toolId: string) =>
    req<{ saved: boolean }>(`/users/me/saved/${toolId}/check`),
};

// ── Recommend ─────────────────────────────────────────────────────────
export const recommendApi = {
  recommend: (task_description: string, filters?: object, limit = 5) =>
    req<RecommendResponse>("/recommend", {
      method: "POST",
      body: JSON.stringify({ task_description, filters, limit }),
    }),
};

// ── Admin ─────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => req<AdminStats>("/users/admin/stats"),
  getUsers: (params?: Record<string, string | number>) =>
    req<PaginatedResponse<AuthUser>>(`/users/admin?${buildQuery(params)}`),
  changeRole: (userId: string, role: string) =>
    req(`/users/admin/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  deleteUser: (userId: string) =>
    req(`/users/admin/${userId}`, { method: "DELETE" }),
  getSubmissions: (params?: Record<string, string | number>) =>
    req<PaginatedResponse<ToolSubmission>>(
      `/users/admin/submissions?${buildQuery(params)}`
    ),
  getSubmission: (id: string) =>
    req<ToolSubmission>(`/users/admin/submissions/${id}`),
  reviewSubmission: (
    id: string,
    data: {
      action: "approve" | "reject";
      adminNote?: string;
      toolData?: object;
    }
  ) =>
    req(`/users/admin/submissions/${id}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Helpers ───────────────────────────────────────────────────────────
function buildQuery(
  params?: Record<string, string | number | undefined>
): string {
  if (!params) return "";
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
}

// ── Types (minimal frontend shapes matching backend responses) ─────────
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: "user" | "owner" | "admin";
  reviewCount: number;
  helpfulVoteCount: number;
  createdAt: string;
}

export interface BackendTool {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  toolType: string;
  pricingType: string;
  logoUrl?: string;
  websiteUrl?: string;
  hasApi: boolean;
  isOpenSource: boolean;
  isFeatured: boolean;
  ratingOverall?: number;
  reviewsCount: number;
  contextWindowTokens?: number;
  providerId?: { name: string; slug: string; logoUrl?: string };
  useCaseCoverage: { useCase: string; confidence: number }[];
  benchmarks: { benchmarkName: string; score: number; scoreUnit?: string }[];
}

export interface BackendCategory {
  id: string;
  slug: string;
  toolType: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface BackendReview {
  _id: string;
  toolId: { _id: string; name: string; slug: string; logoUrl?: string };
  userId: {
    _id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  useCase: string;
  ratingOverall: number;
  reviewText: string;
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface ToolSubmission {
  _id: string;
  submittedById: { username: string; email: string; displayName?: string };
  submittedByEmail: string;
  name: string;
  website: string;
  tagline: string;
  description: string;
  toolType: string;
  pricing: string;
  ownerName: string;
  ownerEmail: string;
  logoUrl?: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface RecommendResponse {
  intent: object;
  recommendations: {
    rank: number;
    tool: BackendTool;
    score: number;
    matchReason: string;
  }[];
  cached: boolean;
}

export interface AdminStats {
  totalUsers: number;
  roleBreakdown: Record<string, number>;
  totalTools: number;
  totalReviews: number;
  pendingSubmissions: number;
}

export interface CreateReviewPayload {
  toolId: string;
  useCase: string;
  ratingOverall: number;
  ratingAccuracy?: number;
  ratingSpeed?: number;
  ratingCostValue?: number;
  ratingEaseOfUse?: number;
  reviewText: string;
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;
}
