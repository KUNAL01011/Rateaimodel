import { z } from "zod";

export const recommendSchema = z.object({
  task_description: z.string().min(10, "Please describe your task in at least 10 characters"),
  filters: z.object({
    max_price_per_month: z.number().optional(),
    requires_api: z.boolean().optional(),
    open_source_only: z.boolean().optional(),
    language: z.string().optional(),
    toolType: z.string().optional(),
  }).optional(),
  limit: z.number().int().min(1).max(10).optional(),
});