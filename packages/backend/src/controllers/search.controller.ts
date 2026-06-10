import { asyncHandler, ApiResponse, escapeRegex } from "@/utils";
import { Request, Response } from "express";
import { Tool, Provider } from "@/models";

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

  // Flexible query: "gpt 4" -> matches "gpt-4", "gpt4", etc.
  const terms = query
    .split(/[\s\-]+/)
    .filter(Boolean)
    .map(escapeRegex);
  const flexibleRegex = terms.join(".*");

  const matchingProviders = await Provider.find(
    {
      name: { $regex: flexibleRegex, $options: "i" },
    },
    "_id"
  );
  const providerIds = matchingProviders.map(p => p._id);

  const textFilter = {
    isDeprecated: false,
    $or: [
      { name: { $regex: flexibleRegex, $options: "i" } },
      { slug: { $regex: flexibleRegex, $options: "i" } },
      { shortDescription: { $regex: flexibleRegex, $options: "i" } },
      { fullDescription: { $regex: flexibleRegex, $options: "i" } },
      { "useCaseCoverage.useCase": { $regex: flexibleRegex, $options: "i" } },
      ...(providerIds.length > 0 ? [{ providerId: { $in: providerIds } }] : []),
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
