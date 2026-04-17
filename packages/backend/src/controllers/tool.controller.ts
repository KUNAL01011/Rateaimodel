import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { toolService } from "@/services";
import { analyticsService } from "@/services";

export const getTools = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, toolType, use_case, pricing, has_api, open_source, sort, q, sortOrder } = req.query;
  const result = await toolService.getAll({
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    toolType: toolType as string | undefined,
    use_case: use_case as string | undefined,
    pricing: pricing as string | undefined,
    has_api: has_api as string | undefined,
    open_source: open_source as string | undefined,
    sort: sort as string | undefined,
    q: q as string | undefined,
    sortOrder: sortOrder as string | undefined,
  });
  return res.status(200).json(new ApiResponse(200, result, "Tools fetched"));
});

export const getToolBySlug = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.getBySlug(req.params.slug as string);
  // Fire-and-forget analytics
  analyticsService.recordPageView(String(tool._id)).catch(() => {});
  return res.status(200).json(new ApiResponse(200, tool, "Tool fetched"));
});

export const getSimilarTools = asyncHandler(async (req: Request, res: Response) => {
  const tools = await toolService.getSimilar(req.params.slug as string, Number(req.query.limit ?? 5));
  return res.status(200).json(new ApiResponse(200, tools, "Similar tools fetched"));
});

export const getFeaturedTools = asyncHandler(async (req: Request, res: Response) => {
  const tools = await toolService.getFeatured(Number(req.query.limit ?? 10));
  return res.status(200).json(new ApiResponse(200, tools, "Featured tools fetched"));
});

export const createTool = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.create(req.body);
  return res.status(201).json(new ApiResponse(201, tool, "Tool created"));
});

export const updateTool = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.update(req.params.slug as string, req.body);
  return res.status(200).json(new ApiResponse(200, tool, "Tool updated"));
});

export const deleteTool = asyncHandler(async (req: Request, res: Response) => {
  await toolService.delete(req.params.slug as string);
  return res.status(200).json(new ApiResponse(200, null, "Tool deleted"));
});

export const upsertBenchmark = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.upsertBenchmark(req.params.slug as string, req.body);
  return res.status(200).json(new ApiResponse(200, tool, "Benchmark updated"));
});