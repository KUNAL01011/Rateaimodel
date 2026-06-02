import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { toolService } from "@/services";
import { analyticsService } from "@/services";
import { uploadSubmissionToDrive } from "@/services/drive.service";
import { deleteLocalFile, uploadImage } from "@/configs/cloudinary.config";

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
    // Fire-and-forget analytics
    analyticsService.recordPageView(String(tool._id)).catch(() => {});
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
    const tools = await toolService.getFeatured(Number(req.query.limit ?? 10));
    return res
      .status(200)
      .json(new ApiResponse(200, tools, "Featured tools fetched"));
  }
);

export const createTool = asyncHandler(async (req: Request, res: Response) => {
  const tool = await toolService.create(req.body);
  return res.status(201).json(new ApiResponse(201, tool, "Tool created"));
});

export const createToolListingRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body;
    let logoUrl = "No logo provided";

    // 1. If a logo file was attached, upload to Cloudinary
    if (req.file) {
      const uploadRes = await uploadImage(req.file.path, "tool-submissions");
      logoUrl = uploadRes.secure_url;
      // Clean up local temp file after upload
      deleteLocalFile(req.file.path);
    }

    // 2. Format the submission into a readable text format for Google Drive
    const submissionText = `
--- NEW TOOL SUBMISSION ---
Name: ${data.name}
Website: ${data.website}
Tagline: ${data.tagline}
Description: ${data.description}
Tool Type: ${data.toolType}
Pricing: ${data.pricing}
Pricing Details: ${data.pricingDetails || "N/A"}
Modalities: ${data.modalities || "N/A"}
Has API: ${data.hasApi}
Is Open Source: ${data.isOpenSource}

-- Provider Info --
Owner Name: ${data.ownerName}
Owner Email: ${data.ownerEmail}

-- Assets --
Logo URL: ${logoUrl}
`;

    // 3. Upload the text file to Google Drive
    const safeFileName = data.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    await uploadSubmissionToDrive(
      `submission_${safeFileName}_${Date.now()}`,
      submissionText
    );

    // 4. Return success to the frontend (data is NOT saved to the DB yet)
    return res
      .status(201)
      .json(new ApiResponse(201, null, "Tool submission sent for review."));
  }
);
