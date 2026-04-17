import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { analyticsService } from "@/services";

/* ── Owner: get analytics for a tool they own ── */
export const getMyToolAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 30);
  const result = await analyticsService.getToolAnalytics(
    req.params.toolId as string,
    req.userId!,
    days
  );
  return res.status(200).json(new ApiResponse(200, result, "Analytics fetched"));
});

/* ── Admin: get analytics for any tool ── */
export const getToolAnalyticsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 30);
  const data = await analyticsService.getToolAnalyticsAdmin(req.params.toolId as string, days);
  return res.status(200).json(new ApiResponse(200, data, "Analytics fetched"));
});