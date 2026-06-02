import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { recommendationService } from "@/services";
import { analyticsService } from "@/services";

export const recommend = asyncHandler(async (req: Request, res: Response) => {
  const { task_description, filters, limit } = req.body;
  const result = await recommendationService.recommend(
    task_description,
    filters,
    limit
  );

  result.recommendations.forEach((r: any) => {
    analyticsService
      .recordRecommendAppearance(String(r.tool._id))
      .catch(() => {});
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recommendations ready"));
});
