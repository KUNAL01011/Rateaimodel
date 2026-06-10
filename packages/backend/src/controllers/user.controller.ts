import type { Request, Response } from "express";
import { asyncHandler, ApiResponse, ApiError } from "@/utils";
import { userService } from "@/services";
import { SavedTool, Tool, Review, ToolSubmission } from "@/models";

/* ─── Public profile ──────────────────────────────────────────────── */
export const getPublicProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await userService.getPublicProfile(
      req.params.username as string
    );
    return res
      .status(200)
      .json(new ApiResponse(200, profile, "Profile fetched"));
  }
);

export const getUserReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const result = await userService.getUserReviews(
      req.params.username as string,
      {
        page: Number(page ?? 1),
        limit: Number(limit ?? 10),
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Reviews fetched"));
  }
);

/* ─── Own profile ─────────────────────────────────────────────────── */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getOwnProfile(req.userId!);
  return res.status(200).json(new ApiResponse(200, profile, "Profile fetched"));
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const updated = await userService.updateProfile(req.userId!, req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Profile updated"));
  }
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    await userService.deleteAccount(req.userId!);
    const cookieOpts = {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
        | "none"
        | "lax",
    };
    res.clearCookie("accessToken", cookieOpts);
    return res.status(200).json(new ApiResponse(200, null, "Account deleted"));
  }
);

/* ─── Saved Tools ─────────────────────────────────────────────────── */
export const getSavedTools = asyncHandler(
  async (req: Request, res: Response) => {
    const saved = await SavedTool.find({ userId: req.userId })
      .populate({
        path: "toolId",
        populate: { path: "providerId", select: "name slug logoUrl" },
      })
      .sort({ savedAt: -1 });
    const tools = saved.map(s => s.toolId).filter(Boolean);
    return res
      .status(200)
      .json(new ApiResponse(200, tools, "Saved tools fetched"));
  }
);

export const toggleSavedTool = asyncHandler(
  async (req: Request, res: Response) => {
    const toolId = req.params.toolId as string;

    const tool = await Tool.findById(toolId);
    if (!tool) throw new ApiError(404, "Tool not found");

    const existing = await SavedTool.findOne({ userId: req.userId, toolId });
    if (existing) {
      await existing.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, { saved: false }, "Removed from saved"));
    } else {
      await SavedTool.create({ userId: req.userId, toolId });
      return res
        .status(200)
        .json(new ApiResponse(200, { saved: true }, "Added to saved"));
    }
  }
);

export const checkSavedTool = asyncHandler(
  async (req: Request, res: Response) => {
    const { toolId } = req.params;
    const existing = await SavedTool.findOne({ userId: req.userId, toolId });
    return res
      .status(200)
      .json(new ApiResponse(200, { saved: !!existing }, "Checked"));
  }
);

/* ─── Admin: Users ────────────────────────────────────────────────── */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page,
    limit,
    role,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const result = await userService.getAllUsers({
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    role: role as string | undefined,
    search: search as string | undefined,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });
  return res.status(200).json(new ApiResponse(200, result, "Users fetched"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getByIdAdmin(req.params.userId as string);
  return res.status(200).json(new ApiResponse(200, user, "User fetched"));
});

export const changeUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const updated = await userService.changeRole(
      req.params.userId as string,
      req.body.role
    );
    return res.status(200).json(new ApiResponse(200, updated, "Role updated"));
  }
);

export const deleteUserAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    await userService.deleteAccount(req.params.userId as string);
    return res.status(200).json(new ApiResponse(200, null, "User deleted"));
  }
);

export const getPlatformStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [userStats, toolCount, reviewCount, pendingSubmissions] =
      await Promise.all([
        userService.getPlatformStats(),
        Tool.countDocuments({ isDeprecated: false }),
        Review.countDocuments({ isHidden: false }),
        ToolSubmission.countDocuments({ status: "pending" }),
      ]);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...userStats,
          totalTools: toolCount,
          totalReviews: reviewCount,
          pendingSubmissions,
        },
        "Stats fetched"
      )
    );
  }
);

/* ─── Admin: Tool Submissions ─────────────────────────────────────── */
export const getAllSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = "1", limit = "20", status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      ToolSubmission.find(filter)
        .populate("submittedById", "username email displayName avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ToolSubmission.countDocuments(filter),
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
        "Submissions fetched"
      )
    );
  }
);

export const getSubmissionById = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await ToolSubmission.findById(req.params.id).populate(
      "submittedById",
      "username email displayName avatarUrl"
    );
    if (!submission) throw new ApiError(404, "Submission not found");
    return res
      .status(200)
      .json(new ApiResponse(200, submission, "Submission fetched"));
  }
);

export const reviewSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { action, adminNote, toolData } = req.body; // action: "approve" | "reject"
    const submission = await ToolSubmission.findById(req.params.id);
    if (!submission) throw new ApiError(404, "Submission not found");
    if (submission.status !== "pending")
      throw new ApiError(400, "Submission already reviewed");

    if (action === "reject") {
      submission.status = "rejected";
      submission.reviewedById = req.userId as any;
      submission.reviewedAt = new Date();
      submission.adminNote = adminNote;
      await submission.save();
      return res
        .status(200)
        .json(new ApiResponse(200, submission, "Submission rejected"));
    }

    if (action === "approve") {
      // Import Tool model and create it
      const { Tool } = await import("@/models");

      // Build slug from name
      const slug =
        toolData?.slug ??
        submission.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      // Check if slug exists
      const exists = await Tool.findOne({ slug });
      if (exists)
        throw new ApiError(
          409,
          `A tool with slug "${slug}" already exists. Provide a different slug.`
        );

      const pricingTypeMap: Record<string, string> = {
        Free: "free",
        Freemium: "freemium",
        "Paid (Subscription)": "subscription",
        "Pay-as-you-go": "pay_per_use",
        Enterprise: "enterprise",
        "Open Source": "open_source_free",
      };

      const toolTypeMap: Record<string, string> = {
        "LLM / Language Model": "llm_model",
        "Image Generation": "image_model",
        "Video Generation": "video_model",
        "Audio / Music": "audio_model",
        "Code Assistant": "coding_tool",
        "AI Agent": "agent_framework",
        "Chatbot / Bot": "chat_product",
        "Workflow Automation": "agent_framework",
        "Data & Analytics": "chat_product",
        Multimodal: "multimodal_tool",
        Other: "chat_product",
      };

      const newTool = await Tool.create({
        slug,
        name: toolData?.name ?? submission.name,
        shortDescription: toolData?.shortDescription ?? submission.tagline,
        fullDescription: toolData?.fullDescription ?? submission.description,
        toolType: toolTypeMap[submission.toolType] ?? "chat_product",
        pricingType: pricingTypeMap[submission.pricing] ?? "freemium",
        hasApi: submission.hasApi,
        isOpenSource: submission.isOpenSource,
        logoUrl: submission.logoUrl,
        websiteUrl: submission.website,
        hasFreeTier:
          submission.pricing === "Free" || submission.pricing === "Freemium",
        verificationStatus: "unverified",
        isFeatured: false,
        ...toolData, // allow admin to override anything
      });

      submission.status = "approved";
      submission.reviewedById = req.userId as any;
      submission.reviewedAt = new Date();
      submission.adminNote = adminNote;
      submission.approvedToolId = newTool._id as any;
      await submission.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { submission, tool: newTool },
            "Submission approved and tool listed"
          )
        );
    }

    throw new ApiError(400, "Invalid action. Use 'approve' or 'reject'");
  }
);

export const deleteSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await ToolSubmission.findById(req.params.id);
    if (!submission) throw new ApiError(404, "Submission not found");
    await submission.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Submission deleted"));
  }
);

export const updateSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await ToolSubmission.findById(req.params.id);
    if (!submission) throw new ApiError(404, "Submission not found");
    if (submission.status !== "pending")
      throw new ApiError(400, "Cannot edit a reviewed submission");

    const allowed = [
      "name",
      "website",
      "tagline",
      "description",
      "toolType",
      "pricing",
      "pricingDetails",
      "modalities",
      "hasApi",
      "isOpenSource",
      "ownerName",
      "ownerEmail",
    ] as const;

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        (submission as any)[field] = req.body[field];
      }
    });

    await submission.save();
    return res
      .status(200)
      .json(new ApiResponse(200, submission, "Submission updated"));
  }
);
