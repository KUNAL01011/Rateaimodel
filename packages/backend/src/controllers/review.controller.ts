import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { reviewService } from "@/services";
import { analyticsService } from "@/services";

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, toolId, useCase, userId, sortBy, sortOrder } = req.query;
  const result = await reviewService.getAll({
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    toolId: toolId as string | undefined,
    useCase: useCase as string | undefined,
    userId: userId as string | undefined,
    sortBy: sortBy as string | undefined,
    sortOrder: sortOrder as "asc" | "desc" | undefined,
  });
  return res.status(200).json(new ApiResponse(200, result, "Reviews fetched"));
});

export const getReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.getById(req.params.id as string);
  return res.status(200).json(new ApiResponse(200, review, "Review fetched"));
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.create(req.userId!, req.body);
  // Fire-and-forget analytics
  analyticsService.recordReviewReceived(req.body.toolId).catch(() => {});
  return res.status(201).json(new ApiResponse(201, review, "Review submitted"));
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.update(req.params.id as string, req.userId!, req.body);
  return res.status(200).json(new ApiResponse(200, review, "Review updated"));
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.delete(req.params.id as string, req.userId!);
  return res.status(200).json(new ApiResponse(200, null, "Review deleted"));
});

export const voteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.vote(req.params.id as string, req.userId!, req.body.voteType);
  return res.status(200).json(new ApiResponse(200, review, "Vote recorded"));
});

export const addOwnerResponse = asyncHandler(async (req: Request, res: Response) => {
  const response = await reviewService.addOwnerResponse(req.params.id as string, req.userId!, req.body.content);
  return res.status(201).json(new ApiResponse(201, response, "Response added"));
});

export const updateOwnerResponse = asyncHandler(async (req: Request, res: Response) => {
  const response = await reviewService.updateOwnerResponse(req.params.id as string, req.userId!, req.body.content);
  return res.status(200).json(new ApiResponse(200, response, "Response updated"));
});

/* Admin */
export const hideReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.toggleHide(req.params.id as string, true, req.body.reason);
  return res.status(200).json(new ApiResponse(200, review, "Review hidden"));
});

export const unhideReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.toggleHide(req.params.id as string, false);
  return res.status(200).json(new ApiResponse(200, review, "Review unhidden"));
});