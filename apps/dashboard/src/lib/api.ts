// ─── API Client ──────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    ...opts,
  });
  const json = await res
    .json()
    .catch(() => ({ message: `HTTP ${res.status}` }));
  if (!res.ok)
    throw new ApiError(
      res.status,
      json.message ?? `Request failed: ${res.status}`
    );
  return json.data as T;
}

async function requestForm<T>(
  path: string,
  body: FormData,
  method = "POST"
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    method,
    body,
  });
  const json = await res
    .json()
    .catch(() => ({ message: `HTTP ${res.status}` }));
  if (!res.ok)
    throw new ApiError(
      res.status,
      json.message ?? `Request failed: ${res.status}`
    );
  return json.data as T;
}

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
  login: (email: string, password: string) =>
    request<{ user: AuthUser; accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

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

export interface Tool {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  toolType: string;
  pricingType: string;
  ratingOverall?: number;
  reviewsCount: number;
  isFeatured: boolean;
  isDeprecated: boolean;
  verificationStatus: string;
  logoUrl?: string;
  websiteUrl?: string;
  apiDocsUrl?: string;
  githubUrl?: string;
  paperUrl?: string;
  providerId?: { name: string; slug: string; logoUrl?: string };
  hasApi: boolean;
  isOpenSource: boolean;
  hasFreeTier: boolean;
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  modelFamily?: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const TOOL_TYPE_OPTIONS = [
  { value: "llm_model", label: "LLM / Language Model" },
  { value: "chat_product", label: "Chat Product" },
  { value: "search_product", label: "AI Search" },
  { value: "coding_tool", label: "Coding Tool" },
  { value: "image_model", label: "Image Generation" },
  { value: "video_model", label: "Video Generation" },
  { value: "audio_model", label: "Audio & Music" },
  { value: "embedding_model", label: "Embedding Model" },
  { value: "agent_framework", label: "AI Agent / Framework" },
  { value: "multimodal_tool", label: "Multimodal Tool" },
  { value: "open_source_model", label: "Open Source Model" },
];

export const PRICING_TYPE_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "open_source_free", label: "Open Source (Free)" },
  { value: "freemium", label: "Freemium" },
  { value: "subscription", label: "Subscription" },
  { value: "pay_per_token", label: "Pay per Token" },
  { value: "pay_per_use", label: "Pay per Use" },
  { value: "enterprise", label: "Enterprise" },
];

export const toolsApi = {
  getAll: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<PaginatedResult<Tool>>(`/tools?${qs}`);
  },
  getBySlug: (slug: string) => request<Tool>(`/tools/${slug}`),
  // Direct JSON creation (no logo) — admin only, POST /tools
  createJson: (data: Record<string, any>) =>
    request<Tool>("/tools", { method: "POST", body: JSON.stringify(data) }),
  // Creation with logo → multipart POST /tools/submit (authenticated user submission route)
  // returns { id } of the ToolSubmission, then we immediately auto-approve it
  createWithLogo: (data: Record<string, any>, logoFile: File) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
    });
    form.append("logo", logoFile);
    return requestForm<{ id: string }>("/tools/submit", form, "POST");
  },
  update: (slug: string, data: Partial<Tool>) =>
    request<Tool>(`/tools/${slug}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (slug: string) =>
    request<null>(`/tools/${slug}`, { method: "DELETE" }),
  toggleFeatured: (slug: string, isFeatured: boolean) =>
    request<Tool>(`/tools/${slug}`, {
      method: "PUT",
      body: JSON.stringify({ isFeatured }),
    }),
  // Bulk import — upsert many tools by slug. `rows` are spreadsheet-shaped
  // objects keyed by the CSV column headers.
  bulkImport: (rows: Record<string, string>[]) =>
    request<BulkImportReport>("/tools/bulk", {
      method: "POST",
      body: JSON.stringify({ rows }),
    }),
};

export interface BulkRowResult {
  row: number;
  slug: string;
  name: string;
  status: "created" | "updated" | "failed";
  error?: string;
}
export interface BulkImportReport {
  total: number;
  created: number;
  updated: number;
  failed: number;
  results: BulkRowResult[];
}

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
  update: (
    id: string,
    data: Partial<Omit<Submission, "_id" | "status" | "createdAt">>
  ) =>
    request<Submission>(`/users/admin/submissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<null>(`/users/admin/submissions/${id}`, { method: "DELETE" }),
};

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

// ─── Site settings ─────────────────────────────────────────────────────────────
export interface SiteSettings {
  siteName: string;
  tagline: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  ogImageUrl?: string;
  canonicalBaseUrl?: string;
  twitterHandle?: string;
  pageSeo: {
    path: string;
    label?: string;
    title?: string;
    description?: string;
    keywords?: string[];
    ogImageUrl?: string;
    canonical?: string;
    noindex?: boolean;
  }[];
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
  twitterUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  blogEnabled: boolean;
  announcement?: string;
}

export const settingsApi = {
  get: () => request<SiteSettings>("/settings"),
  update: (data: Partial<SiteSettings>) =>
    request<SiteSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─── Blog ──────────────────────────────────────────────────────────────────────
export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  category?: string;
  featured: boolean;
  status: "draft" | "published";
  authorName: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  noindex: boolean;
  readingMinutes: number;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BlogInput = Partial<
  Omit<BlogPost, "_id" | "readingMinutes" | "views" | "createdAt" | "updatedAt">
>;

export const blogApi = {
  listAdmin: (status?: string) => {
    const qs = status && status !== "all" ? `?status=${status}&limit=100` : "?limit=100";
    return request<PaginatedResult<BlogPost>>(`/blog/admin${qs}`);
  },
  get: (slug: string) => request<BlogPost>(`/blog/admin/${slug}`),
  create: (data: BlogInput) =>
    request<BlogPost>("/blog", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: BlogInput) =>
    request<BlogPost>(`/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => request<null>(`/blog/${id}`, { method: "DELETE" }),
};

// ─── Image upload (Cloudinary) ──────────────────────────────────────────────────
export const uploadApi = {
  image: (file: File, folder = "blog") => {
    const form = new FormData();
    form.append("image", file);
    return requestForm<{ url: string; width: number; height: number }>(
      `/uploads/image?folder=${encodeURIComponent(folder)}`,
      form,
      "POST"
    );
  },
};
