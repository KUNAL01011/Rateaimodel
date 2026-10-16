import { z } from "zod";
import { USE_CASES } from "@/models/enums";

export const createReviewSchema = z.object({
  toolId: z.string().min(1),
  useCase: z.enum(USE_CASES),
  ratingOverall: z.number().int().min(1).max(5),
  ratingAccuracy: z.number().int().min(1).max(5).optional(),
  ratingSpeed: z.number().int().min(1).max(5).optional(),
  ratingCostValue: z.number().int().min(1).max(5).optional(),
  ratingEaseOfUse: z.number().int().min(1).max(5).optional(),
  ratingUseCaseFit: z.number().int().min(1).max(5).optional(),
  reviewText: z.string().min(50, "Review must be at least 50 characters"),
  pros: z.string().optional(),
  cons: z.string().optional(),
  wouldRecommend: z.boolean(),
});

export const updateReviewSchema = createReviewSchema
  .omit({ toolId: true })
  .partial();

export const reviewQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  toolId: z.string().optional(),
  useCase: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(["createdAt", "ratingOverall", "upvotes"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const voteReviewSchema = z.object({
  voteType: z.enum(["up", "down"]),
});

export const ownerResponseSchema = z.object({
  content: z.string().min(10, "Response must be at least 10 characters"),
});