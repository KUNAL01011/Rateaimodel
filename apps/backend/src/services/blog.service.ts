import { BlogPost } from "@/models";
import { ApiError } from "@/utils";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "post";
  let n = 1;
  // Append -2, -3… until unique
  while (true) {
    const existing = await BlogPost.findOne({ slug });
    if (!existing || String(existing._id) === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export const blogService = {
  async listPublished({
    page = 1,
    limit = 12,
    tag,
  }: {
    page?: number;
    limit?: number;
    tag?: string;
  }) {
    const filter: Record<string, any> = {
      status: "published",
      publishedAt: { $lte: new Date() },
    };
    if (tag) filter.tags = tag;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ featured: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content"),
      BlogPost.countDocuments(filter),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async listAll({
    page = 1,
    limit = 50,
    status,
  }: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const filter: Record<string, any> = {};
    if (status && status !== "all") filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content"),
      BlogPost.countDocuments(filter),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getBySlug(slug: string, { admin = false } = {}) {
    const query: Record<string, any> = admin
      ? { slug }
      : { slug, status: "published", publishedAt: { $lte: new Date() } };
    const post = await BlogPost.findOne(query);
    if (!post) throw new ApiError(404, "Blog post not found");
    return post;
  },

  async recordView(slug: string) {
    await BlogPost.updateOne(
      { slug, status: "published" },
      { $inc: { views: 1 } }
    );
  },

  async getAllSlugs() {
    return BlogPost.find({
      status: "published",
      publishedAt: { $lte: new Date() },
    })
      .select("slug updatedAt publishedAt")
      .sort({ publishedAt: -1 });
  },

  async create(data: any) {
    const base = data.slug ? slugify(data.slug) : slugify(data.title ?? "");
    const slug = await uniqueSlug(base);
    const status = data.status === "published" ? "published" : "draft";
    const publishedAt = data.publishedAt
      ? new Date(data.publishedAt)
      : status === "published"
        ? new Date()
        : undefined;
    const post = await BlogPost.create({
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      tags: data.tags ?? [],
      status,
      featured: data.featured ?? false,
      category: data.category,
      authorName: data.authorName || "RateAI Team",
      authorId: data.authorId,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ogImageUrl: data.ogImageUrl,
      noindex: data.noindex ?? false,
      readingMinutes: readingMinutes(data.content ?? ""),
      publishedAt,
    });
    return post;
  },

  async update(id: string, data: any) {
    const post = await BlogPost.findById(id);
    if (!post) throw new ApiError(404, "Blog post not found");

    if (data.slug) post.slug = await uniqueSlug(slugify(data.slug), id);
    if (data.title !== undefined) post.title = data.title;
    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.content !== undefined) {
      post.content = data.content;
      post.readingMinutes = readingMinutes(data.content);
    }
    if (data.coverImageUrl !== undefined) post.coverImageUrl = data.coverImageUrl;
    if (data.tags !== undefined) post.tags = data.tags;
    if (data.metaTitle !== undefined) post.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
      post.metaDescription = data.metaDescription;
    if (data.ogImageUrl !== undefined) post.ogImageUrl = data.ogImageUrl;
    if (data.authorName !== undefined) post.authorName = data.authorName;
    if (data.featured !== undefined) post.featured = data.featured;
    if (data.category !== undefined) post.category = data.category;
    if (data.noindex !== undefined) post.noindex = data.noindex;

    if (data.status && data.status !== post.status) {
      post.status = data.status;
      if (data.status === "published" && !post.publishedAt)
        post.publishedAt = new Date();
    }
    // Explicit publish date (scheduling / backdating)
    if (data.publishedAt !== undefined) {
      post.publishedAt = data.publishedAt ? new Date(data.publishedAt) : undefined;
    }

    await post.save();
    return post;
  },

  async remove(id: string) {
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) throw new ApiError(404, "Blog post not found");
    return post;
  },
};
