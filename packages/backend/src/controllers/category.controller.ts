import { asyncHandler } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const categories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const categoryDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
