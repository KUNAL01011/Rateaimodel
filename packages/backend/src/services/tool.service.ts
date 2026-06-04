import { Review, Tool } from "@/models";
import { ApiError } from "@/utils";

export const toolService = {
  async getAll({
    page = 1,
    limit = 20,
    toolType,
    use_case,
    pricing,
    has_api,
    open_source,
    sort = "newest",
    q,
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    toolType?: string;
    use_case?: string;
    pricing?: string;
    has_api?: string;
    open_source?: string;
    sort?: string;
    q?: string;
    sortOrder?: string;
  }) {
    const filter: Record<string, any> = { isDeprecated: false };
    if (toolType) filter.toolType = toolType;
    if (pricing) filter.pricingType = pricing;
    if (has_api === "true") filter.hasApi = true;
    if (open_source === "true") filter.isOpenSource = true;
    if (use_case) filter["useCaseCoverage.useCase"] = use_case;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { ratingOverall: -1 },
      reviews_count: { reviewsCount: -1 },
      newest: { createdAt: -1 },
      name: { name: 1 },
    };
    const sortObj = sortMap[sort] ?? { createdAt: -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Tool.find(filter)
        .populate("providerId", "name slug logoUrl")
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Tool.countDocuments(filter),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getBySlug(slug: string) {
    const tool = await Tool.findOne({ slug }).populate(
      "providerId",
      "name slug logoUrl website"
    );
    if (!tool) throw new ApiError(404, "Tool not found");
    return tool;
  },

  async getById(id: string) {
    const tool = await Tool.findById(id).populate(
      "providerId",
      "name slug logoUrl"
    );
    if (!tool) throw new ApiError(404, "Tool not found");
    return tool;
  },

  async getSimilar(slug: string, limit = 5) {
    const tool = await Tool.findOne({ slug });
    if (!tool) throw new ApiError(404, "Tool not found");
    const useCases = tool.useCaseCoverage.map(u => u.useCase);
    return Tool.find({
      slug: { $ne: slug },
      isDeprecated: false,
      "useCaseCoverage.useCase": { $in: useCases },
    })
      .populate("providerId", "name slug logoUrl")
      .sort({ ratingOverall: -1 })
      .limit(limit);
  },

  async getFeatured(limit = 10) {
    return Tool.find({ isFeatured: true, isDeprecated: false })
      .populate("providerId", "name slug logoUrl")
      .sort({ ratingOverall: -1 })
      .limit(limit);
  },

  // Trending = most reviewed in recent period (or just reviewsCount-sorted)
  async getTrending(limit = 10) {
    return Tool.find({ isDeprecated: false })
      .populate("providerId", "name slug logoUrl")
      .sort({ reviewsCount: -1, ratingOverall: -1 })
      .limit(limit);
  },

  async create(data: any) {
    const exists = await Tool.findOne({ slug: data.slug });
    if (exists) throw new ApiError(409, "A tool with this slug already exists");
    return Tool.create(data);
  },

  async update(slug: string, data: any) {
    const tool = await Tool.findOneAndUpdate({ slug }, data, {
      new: true,
      runValidators: true,
    });
    if (!tool) throw new ApiError(404, "Tool not found");
    return tool;
  },

  async delete(slug: string) {
    const tool = await Tool.findOneAndDelete({ slug });
    if (!tool) throw new ApiError(404, "Tool not found");
    return tool;
  },

  async upsertBenchmark(slug: string, benchmarkData: any) {
    const tool = await Tool.findOne({ slug });
    if (!tool) throw new ApiError(404, "Tool not found");
    const idx = tool.benchmarks.findIndex(
      b => b.benchmarkName === benchmarkData.benchmarkName
    );
    if (idx >= 0) {
      Object.assign(tool.benchmarks[idx], benchmarkData);
    } else {
      tool.benchmarks.push({ ...benchmarkData, createdAt: new Date() });
    }
    await tool.save();
    return tool;
  },

  async refreshAggregateScores(toolId: string) {
    const reviews = await Review.find({ toolId, isHidden: false });
    if (!reviews.length) return;
    const tool = await Tool.findById(toolId);
    if (!tool) return;

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    tool.ratingOverall = avg(reviews.map(r => r.ratingOverall));
    if (reviews.some(r => r.ratingAccuracy))
      tool.ratingAccuracy = avg(
        reviews.filter(r => r.ratingAccuracy).map(r => r.ratingAccuracy!)
      );
    if (reviews.some(r => r.ratingSpeed))
      tool.ratingSpeed = avg(
        reviews.filter(r => r.ratingSpeed).map(r => r.ratingSpeed!)
      );
    if (reviews.some(r => r.ratingCostValue))
      tool.ratingCostValue = avg(
        reviews.filter(r => r.ratingCostValue).map(r => r.ratingCostValue!)
      );
    if (reviews.some(r => r.ratingEaseOfUse))
      tool.ratingEaseOfUse = avg(
        reviews.filter(r => r.ratingEaseOfUse).map(r => r.ratingEaseOfUse!)
      );
    tool.reviewsCount = reviews.length;

    const useCaseMap = new Map<string, number[]>();
    for (const r of reviews) {
      if (!useCaseMap.has(r.useCase)) useCaseMap.set(r.useCase, []);
      useCaseMap.get(r.useCase)!.push(r.ratingOverall);
    }
    tool.useCaseScores = Array.from(useCaseMap.entries()).map(
      ([useCase, scores]) => ({
        useCase: useCase as any,
        avgScore: avg(scores),
        reviewCount: scores.length,
        lastRefreshed: new Date(),
      })
    );

    await tool.save();
  },
};
