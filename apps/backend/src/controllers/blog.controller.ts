import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { blogService } from "@/services";

/* ── Public ──────────────────────────────────────────────────────────────── */

export const getBlogPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, tag } = req.query;
    const result = await blogService.listPublished({
      page: Number(page ?? 1),
      limit: Number(limit ?? 12),
      tag: tag as string | undefined,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Blog posts fetched"));
  }
);

export const getBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await blogService.getBySlug(req.params.slug as string);
  blogService.recordView(req.params.slug as string).catch(() => {});
  return res.status(200).json(new ApiResponse(200, post, "Blog post fetched"));
});

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const getAdminBlogPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, status } = req.query;
    const result = await blogService.listAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 50),
      status: status as string | undefined,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Blog posts fetched"));
  }
);

export const getAdminBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    const post = await blogService.getBySlug(req.params.slug as string, {
      admin: true,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, post, "Blog post fetched"));
  }
);

export const createBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    const post = await blogService.create({
      ...req.body,
      authorId: req.userId,
      authorName:
        req.body.authorName ?? (req.user as any)?.displayName ?? "RateAI Team",
    });
    return res.status(201).json(new ApiResponse(201, post, "Blog post created"));
  }
);

export const updateBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    const post = await blogService.update(req.params.id as string, req.body);
    return res.status(200).json(new ApiResponse(200, post, "Blog post updated"));
  }
);

export const deleteBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    await blogService.remove(req.params.id as string);
    return res.status(200).json(new ApiResponse(200, null, "Blog post deleted"));
  }
);
