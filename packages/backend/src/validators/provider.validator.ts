import {z} from "zod";

export const createProviderSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase with hyphens"),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  isOpenSource: z.boolean().optional(),
  hqCountry: z.string().optional(),
  foundedYear: z.number().int().optional(),
});

export const updateProviderSchema = createProviderSchema.partial();

export const providerQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});