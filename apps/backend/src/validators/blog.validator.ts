import { z } from "zod";

const urlOrEmpty = z.string().url().or(z.literal("")).optional();

export const createBlogSchema = z.object({
  title: z.string().min(1).max(160),
  excerpt: z.string().min(1).max(300),
  content: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  coverImageUrl: urlOrEmpty,
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  category: z.string().optional(),
  authorName: z.string().optional(),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(300).optional(),
  ogImageUrl: urlOrEmpty,
  noindex: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();
