import mongoose, { Document, Schema, Types } from "mongoose";

export const BLOG_STATUSES = ["draft", "published"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

/**
 * Blog post — authored by admins from the dashboard (Markdown content),
 * rendered on the public site for SEO and audience growth.
 */
export interface IBlogPost extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  coverImageUrl?: string;
  tags: string[];

  status: BlogStatus;
  featured: boolean;
  category?: string;
  authorName: string;
  authorId?: Types.ObjectId;

  // Per-post SEO overrides
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  noindex: boolean;

  readingMinutes: number;
  views: number;
  publishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImageUrl: String,
    tags: { type: [String], default: [] },

    status: {
      type: String,
      enum: BLOG_STATUSES,
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    category: String,
    authorName: { type: String, default: "RateAI Team" },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },

    metaTitle: String,
    metaDescription: String,
    ogImageUrl: String,
    noindex: { type: Boolean, default: false },

    readingMinutes: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true }
);

// Published feed, newest first
BlogPostSchema.index({ status: 1, publishedAt: -1 });

export const BlogPost = mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
