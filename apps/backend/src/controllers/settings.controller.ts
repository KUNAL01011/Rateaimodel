import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { settingsService } from "@/services";

/** GET /api/v1/settings — public (frontend reads SEO/branding). */
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.get();
  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings fetched"));
});

/** PUT /api/v1/settings — admin. */
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const settings = await settingsService.update(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, settings, "Settings updated"));
  }
);
