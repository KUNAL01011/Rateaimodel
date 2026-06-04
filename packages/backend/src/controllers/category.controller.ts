import { asyncHandler, ApiResponse } from "@/utils";
import { Request, Response } from "express";
import { Tool } from "@/models";
import { TOOL_TYPES } from "@/models/enums";

// Map tool types to user-friendly category names
const CATEGORY_META: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  llm_model: {
    name: "Language Models",
    description:
      "Foundation LLMs, chat models, and instruction-following AI for text tasks.",
    icon: "brain",
  },
  chat_product: {
    name: "AI Chat Products",
    description: "Consumer-facing chat products built on top of LLMs.",
    icon: "messageSquare",
  },
  search_product: {
    name: "AI Search",
    description: "AI-powered search and research tools with citations.",
    icon: "search",
  },
  coding_tool: {
    name: "Coding Tools",
    description:
      "AI-powered IDEs, copilots, code review, and engineering agents.",
    icon: "code",
  },
  image_model: {
    name: "Image Generation",
    description: "Diffusion models and creative AI for visual generation.",
    icon: "image",
  },
  video_model: {
    name: "Video Generation",
    description: "Text-to-video, VFX, and temporal synthesis tools.",
    icon: "video",
  },
  audio_model: {
    name: "Audio & Music",
    description: "Text-to-speech, music generation, and voice cloning.",
    icon: "music",
  },
  embedding_model: {
    name: "Embedding Models",
    description: "Vector embeddings for semantic search and RAG.",
    icon: "layers",
  },
  agent_framework: {
    name: "AI Agents",
    description: "Autonomous reasoning engines and multi-agent frameworks.",
    icon: "bot",
  },
  multimodal_tool: {
    name: "Multimodal AI",
    description: "Tools that combine text, vision, audio, and more.",
    icon: "sparkles",
  },
  open_source_model: {
    name: "Open Source Models",
    description: "Freely available models you can self-host and fine-tune.",
    icon: "gitBranch",
  },
};

export const categories = asyncHandler(async (_req: Request, res: Response) => {
  // Aggregate tool counts by type
  const counts = await Tool.aggregate([
    { $match: { isDeprecated: false } },
    { $group: { _id: "$toolType", count: { $sum: 1 } } },
  ]);

  const countMap: Record<string, number> = {};
  counts.forEach((c: { _id: string; count: number }) => {
    countMap[c._id] = c.count;
  });

  const result = TOOL_TYPES.map((type, i) => {
    const meta = CATEGORY_META[type] ?? {
      name: type,
      description: "",
      icon: "box",
    };
    return {
      id: String(i + 1),
      slug: type.replace(/_/g, "-"),
      toolType: type,
      name: meta.name,
      description: meta.description,
      icon: meta.icon,
      count: countMap[type] ?? 0,
    };
  }).filter(c => c.count > 0);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Categories fetched"));
});

export const categoryDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const toolType = slug.replace(/-/g, "_");

    const meta = CATEGORY_META[toolType];
    const count = await Tool.countDocuments({ toolType, isDeprecated: false });
    const featured = await Tool.find({
      toolType,
      isDeprecated: false,
      isFeatured: true,
    })
      .populate("providerId", "name slug logoUrl")
      .sort({ ratingOverall: -1 })
      .limit(6);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          slug,
          toolType,
          name: meta?.name ?? slug,
          description: meta?.description ?? "",
          icon: meta?.icon ?? "box",
          count,
          featured,
        },
        "Category detail fetched"
      )
    );
  }
);
