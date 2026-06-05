// ─── API Client ──────────────────────────────────────────────────────────────

const BASE = "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    ...opts,
  });

  const json = await res
    .json()
    .catch(() => ({ message: `HTTP ${res.status}` }));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message ?? `Request failed: ${res.status}`
    );
  }

  return json.data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
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

export const authApi = {
  getMe: () => request<AuthUser>("/auth/me"),
  logout: () => request<null>("/auth/logout", { method: "POST" }),
  // Google login - sends Firebase idToken
  googleLogin: (idToken: string) =>
    request<{ user: AuthUser; accessToken: string; isNewUser: boolean }>(
      "/auth/google",
      { method: "POST", body: JSON.stringify({ idToken }) }
    ),
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface PlatformStats {
  totalUsers: number;
  totalTools: number;
  totalReviews: number;
  pendingSubmissions: number;
  roleBreakdown: Record<string, number>;
}

export const statsApi = {
  get: () => request<PlatformStats>("/users/admin/stats"),
};

// ─── Tools ────────────────────────────────────────────────────────────────────
export interface Tool {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  toolType: string;
  pricingType: string;
  ratingOverall?: number;
  reviewsCount: number;
  isFeatured: boolean;
  isDeprecated: boolean;
  verificationStatus: string;
  logoUrl?: string;
  websiteUrl?: string;
  providerId?: { name: string; slug: string; logoUrl?: string };
  hasApi: boolean;
  isOpenSource: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const toolsApi = {
  getAll: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<PaginatedResult<Tool>>(`/tools?${qs}`);
  },
  delete: (slug: string) =>
    request<null>(`/tools/${slug}`, { method: "DELETE" }),
  toggleFeatured: (slug: string, isFeatured: boolean) =>
    request<Tool>(`/tools/${slug}`, {
      method: "PUT",
      body: JSON.stringify({ isFeatured }),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: "user" | "owner" | "admin";
  reviewCount: number;
  helpfulVoteCount: number;
  isApiUser: boolean;
  createdAt: string;
}

export const usersApi = {
  getAll: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<PaginatedResult<AdminUser>>(`/users/admin?${qs}`);
  },
  changeRole: (userId: string, role: string) =>
    request<AdminUser>(`/users/admin/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  delete: (userId: string) =>
    request<null>(`/users/admin/${userId}`, { method: "DELETE" }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  toolId: { _id: string; name: string; slug: string; logoUrl?: string } | null;
  userId: { _id: string; username: string; displayName?: string } | null;
  useCase: string;
  ratingOverall: number;
  reviewText: string;
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;
  upvotes: number;
  downvotes: number;
  isHidden: boolean;
  hideReason?: string;
  createdAt: string;
}

export const reviewsApi = {
  getAll: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<PaginatedResult<Review>>(`/reviews?${qs}`);
  },
  hide: (id: string, reason?: string) =>
    request<Review>(`/reviews/${id}/hide`, {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? "Admin moderated" }),
    }),
  unhide: (id: string) =>
    request<Review>(`/reviews/${id}/unhide`, { method: "POST" }),
};

// ─── Submissions ──────────────────────────────────────────────────────────────
export interface Submission {
  _id: string;
  name: string;
  website: string;
  tagline: string;
  description: string;
  toolType: string;
  pricing: string;
  pricingDetails?: string;
  hasApi: boolean;
  isOpenSource: boolean;
  ownerName: string;
  ownerEmail: string;
  logoUrl?: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  submittedById?: { username: string; email: string; displayName?: string };
  submittedByEmail: string;
  createdAt: string;
  modalities?: string[];
}

export const submissionsApi = {
  getAll: (status?: string) => {
    const qs =
      status && status !== "all" ? `?status=${status}&limit=50` : "?limit=50";
    return request<PaginatedResult<Submission>>(
      `/users/admin/submissions${qs}`
    );
  },
  approve: (id: string, slug: string, adminNote?: string) =>
    request<{ submission: Submission; tool: Tool }>(
      `/users/admin/submissions/${id}/review`,
      {
        method: "POST",
        body: JSON.stringify({
          action: "approve",
          adminNote,
          toolData: { slug },
        }),
      }
    ),
  reject: (id: string, adminNote?: string) =>
    request<Submission>(`/users/admin/submissions/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ action: "reject", adminNote }),
    }),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  slug: string;
  toolType: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export const categoriesApi = {
  getAll: () => request<Category[]>("/categories"),
};
