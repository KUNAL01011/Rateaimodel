import { asyncHandler } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const search = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
