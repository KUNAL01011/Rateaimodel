import { asyncHandler, ApiResponse } from "@/utils";
import { Request, Response } from "express";
import { Tool } from "@/models";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = "1", limit = "20" } = req.query;

  if (!q || typeof q !== "string" || q.trim().length < 1) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } },
          "No query provided"
        )
      );
  }

  const query = q.trim();
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const textFilter = {
    isDeprecated: false,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { shortDescription: { $regex: query, $options: "i" } },
      { fullDescription: { $regex: query, $options: "i" } },
      { "useCaseCoverage.useCase": { $regex: query, $options: "i" } },
    ],
  };

  const [data, total] = await Promise.all([
    Tool.find(textFilter)
      .populate("providerId", "name slug logoUrl")
      .sort({ ratingOverall: -1, reviewsCount: -1 })
      .skip(skip)
      .limit(limitNum),
    Tool.countDocuments(textFilter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      "Search results"
    )
  );
});
