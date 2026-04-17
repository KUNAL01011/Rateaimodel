import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { providerService } from "@/services";

export const getProviders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;
  const result = await providerService.getAll({
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    search: search as string | undefined,
    sortBy: sortBy as string | undefined,
    sortOrder: sortOrder as "asc" | "desc" | undefined,
  });
  return res.status(200).json(new ApiResponse(200, result, "Providers fetched"));
});

export const getProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await providerService.getBySlug(req.params.slug as string);
  return res.status(200).json(new ApiResponse(200, provider, "Provider fetched"));
});

export const createProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await providerService.create(req.body);
  return res.status(201).json(new ApiResponse(201, provider, "Provider created"));
});

export const updateProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await providerService.update(req.params.slug as string, req.body);
  return res.status(200).json(new ApiResponse(200, provider, "Provider updated"));
});

export const deleteProvider = asyncHandler(async (req: Request, res: Response) => {
  await providerService.delete(req.params.slug as string);
  return res.status(200).json(new ApiResponse(200, null, "Provider deleted"));
});