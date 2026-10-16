import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { toolService, importService } from "@/services";
// import { analyticsService } from "@/services";
import { uploadImage, deleteLocalFile } from "@/configs/cloudinary.config";
import { ToolSubmission } from "@/models";
import { ApiError } from "@/utils";

export const getTools = asyncHandler(async (req: Request, res: Response) => {
  const {
    page,
    limit,
    toolType,
    use_case,
    pricing,
    has_api,
    open_source,
    sort,
    q,
    sortOrder,
  } = req.query;
  const result = await toolService.getAll({
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    toolType: toolType as string | undefined,
    use_case: use_case as string | undefined,
    pricing: pricing as string | undefined,
    has_api: has_api as string | undefined,
    open_source: open_source as string | undefined,
    sort: sort as string | undefined,
    q: q as string | undefined,
    sortOrder: sortOrder as string | undefined,
  });
  return res.status(200).json(new ApiResponse(200, result, "Tools fetched"));
});

export const getToolBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const tool = await toolService.getBySlug(req.params.slug as string);
    // analyticsService.recordPageView(String(tool._id)).catch(() => {});
    return res.status(200).json(new ApiResponse(200, tool, "Tool fetched"));
  }
);

export const getFeaturedTools = asyncHandler(
  async (req: Request, res: Response) => {
    const tools = await toolService.getFeatured(Number(req.query.limit ?? 10));
    return res
      .status(200)
      .json(new ApiResponse(200, tools, "Featured tools fetched"));
  }
);

export const getTrendingTools = asyncHandler(
  async (req: Request, res: Response) => {
    const tools = await toolService.getTrending(Number(req.query.limit ?? 10));
    return res
      .status(200)
      .json(new ApiResponse(200, tools, "Trending tools fetched"));
  }
);

export const getSimilarTools = asyncHandler(
  async (req: Request, res: Response) => {
    const tools = await toolService.getSimilar(
      req.params.slug as string,
      Number(req.query.limit ?? 5)
    );
    return res
      .status(200)
      .json(new ApiResponse(200, tools, "Similar tools fetched"));
  }
);

export const createTool = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.create(req.body);
  return res.status(201).json(new ApiResponse(201, tool, "Tool created"));
});

export const updateTool = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.update(req.params.slug as string, req.body);
  return res.status(200).json(new ApiResponse(200, tool, "Tool updated"));
});

export const deleteTool = asyncHandler(async (req: Request, res: Response) => {
  await toolService.delete(req.params.slug as string);
  return res.status(200).json(new ApiResponse(200, null, "Tool deleted"));
});

export const upsertBenchmark = asyncHandler(
  async (req: Request, res: Response) => {
    const tool = await toolService.upsertBenchmark(
      req.params.slug as string,
      req.body
    );
    return res
      .status(200)
      .json(new ApiResponse(200, tool, "Benchmark updated"));
  }
);

/* ── POST /api/v1/tools/bulk (admin) ── */
export const bulkImportTools = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await importService.bulkImport(req.body.rows);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          report,
          `Imported ${report.created} new, updated ${report.updated}, ${report.failed} failed`
        )
      );
  }
);

/* ── POST /api/v1/tools/submit ── */
export const createToolListingRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body;
    let logoUrl: string | undefined;

    if (req.file) {
      try {
        const uploadRes = await uploadImage(req.file.path, "tool-submissions");
        logoUrl = uploadRes.secure_url;
      } finally {
        deleteLocalFile(req.file.path);
      }
    }

    const submission = await ToolSubmission.create({
      submittedById: req.userId,
      submittedByEmail: (req.user as any).email,
      name: data.name,
      website: data.website,
      tagline: data.tagline,
      description: data.description,
      toolType: data.toolType,
      pricing: data.pricing,
      pricingDetails: data.pricingDetails,
      modalities: data.modalities,
      hasApi: data.hasApi === "true" || data.hasApi === true,
      isOpenSource: data.isOpenSource === "true" || data.isOpenSource === true,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      logoUrl,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { id: submission._id },
          "Tool submission received. We'll review it within 1-3 business days."
        )
      );
  }
);
