import { asyncHandler, ApiResponse } from "@/utils";
import { Request, Response } from "express";
import { Tool } from "@/models";

// Escape special regex characters to prevent ReDoS
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

  // Guard against NaN from non-numeric strings
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(
    50,
    Math.max(1, parseInt(limit as string, 10) || 20)
  );
  const skip = (pageNum - 1) * limitNum;

  // Escape user input before using in regex to prevent ReDoS
  const safeQuery = escapeRegex(query);

  const textFilter = {
    isDeprecated: false,
    $or: [
      { name: { $regex: safeQuery, $options: "i" } },
      { shortDescription: { $regex: safeQuery, $options: "i" } },
      { fullDescription: { $regex: safeQuery, $options: "i" } },
      { "useCaseCoverage.useCase": { $regex: safeQuery, $options: "i" } },
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
