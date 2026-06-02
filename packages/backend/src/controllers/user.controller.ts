import type { NextFunction, Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";

export const saved = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const savedTool = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
