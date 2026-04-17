import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { recommendationService } from "@/services";
import { analyticsService } from "@/services";

export const recommend = asyncHandler(async (req: Request, res: Response) => {
  const { task_description, filters, limit } = req.body;
  const result = await recommendationService.recommend(task_description, filters, limit);

  // Fire-and-forget: record recomm appearances for each result
  result.recommendations.forEach((r: any) => {
    analyticsService.recordRecommendAppearance(String(r.tool._id)).catch(() => {});
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Recommendations ready")
  );
});

export const recordRecommendClick = asyncHandler(async (req: Request, res: Response) => {
  await analyticsService.recordRecommendClick(req.params.toolId as string);
  return res.status(200).json(new ApiResponse(200, null, "Click recorded"));
});

export const getUseCases = asyncHandler(async (_req: Request, res: Response) => {
  const taxonomy = recommendationService.getUseCaseTaxonomy();
  return res.status(200).json(new ApiResponse(200, taxonomy, "Use-case taxonomy fetched"));
});