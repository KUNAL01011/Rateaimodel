import { Review, ReviewResponse, ReviewVote, Tool } from "@/models";
import { ApiError } from "@/utils";
import { toolService } from "./tool.service";

export const reviewService = {
  async getAll({
    page = 1,
    limit = 20,
    toolId,
    useCase,
    userId,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    toolId?: string;
    useCase?: string;
    userId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const filter: Record<string, any> = { isHidden: false };
    if (toolId) filter.toolId = toolId;
    if (useCase) filter.useCase = useCase;
    if (userId) filter.userId = userId;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "username displayName avatarUrl")
        .populate("toolId", "name slug logoUrl")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const review = await Review.findById(id)
      .populate("userId", "username displayName avatarUrl")
      .populate("toolId", "name slug logoUrl");
    if (!review) throw new ApiError(404, "Review not found");
    return review;
  },

  async create(userId: string, data: any) {
    // Check tool exists
    const tool = await Tool.findById(data.toolId);
    if (!tool) throw new ApiError(404, "Tool not found");

    // One review per user per tool per use-case
    const duplicate = await Review.findOne({
      userId,
      toolId: data.toolId,
      useCase: data.useCase,
    });
    if (duplicate)
      throw new ApiError(
        409,
        "You already reviewed this tool for this use-case"
      );

    const review = await Review.create({ ...data, userId });

    // Increment user review count
    await import("@/models").then(({ User }) =>
      User.findByIdAndUpdate(userId, { $inc: { reviewCount: 1 } })
    );

    // Refresh aggregate scores
    await toolService.refreshAggregateScores(data.toolId);

    return review.populate("userId", "username displayName avatarUrl");
  },

  async update(reviewId: string, userId: string, data: any) {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) throw new ApiError(404, "Review not found or not yours");

    Object.assign(review, data);
    await review.save();
    await toolService.refreshAggregateScores(String(review.toolId));
    return review;
  },

  async delete(reviewId: string, userId: string, isAdmin = false) {
    const filter: any = { _id: reviewId };
    if (!isAdmin) filter.userId = userId;

    const review = await Review.findOneAndDelete(filter);
    if (!review) throw new ApiError(404, "Review not found or not yours");

    // Decrement user review count
    await import("@/models").then(({ User }) =>
      User.findByIdAndUpdate(review.userId, { $inc: { reviewCount: -1 } })
    );

    await toolService.refreshAggregateScores(String(review.toolId));
    return review;
  },

  async vote(reviewId: string, userId: string, voteType: "up" | "down") {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, "Review not found");
    if (String(review.userId) === userId)
      throw new ApiError(400, "You cannot vote on your own review");

    const existing = await ReviewVote.findOne({ reviewId, userId });

    if (existing) {
      if (existing.voteType === voteType) {
        // Remove vote (toggle off)
        await existing.deleteOne();
        const inc =
          voteType === "up"
            ? { $inc: { upvotes: -1 } }
            : { $inc: { downvotes: -1 } };
        await Review.findByIdAndUpdate(reviewId, inc);
      } else {
        // Switch vote
        existing.voteType = voteType;
        await existing.save();
        const inc =
          voteType === "up"
            ? { $inc: { upvotes: 1, downvotes: -1 } }
            : { $inc: { upvotes: -1, downvotes: 1 } };
        await Review.findByIdAndUpdate(reviewId, inc);
      }
    } else {
      await ReviewVote.create({ reviewId, userId, voteType });
      const inc =
        voteType === "up"
          ? { $inc: { upvotes: 1 } }
          : { $inc: { downvotes: 1 } };
      await Review.findByIdAndUpdate(reviewId, inc);

      // Increment helpful vote count on reviewer
      if (voteType === "up") {
        await import("@/models").then(({ User }) =>
          User.findByIdAndUpdate(review.userId, {
            $inc: { helpfulVoteCount: 1 },
          })
        );
      }
    }

    return Review.findById(reviewId);
  },

  async addOwnerResponse(reviewId: string, userId: string, content: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, "Review not found");

    // Verify the user owns the tool
    const { ToolOwnership } = await import("@/models");
    const ownership = await ToolOwnership.findOne({
      toolId: review.toolId,
      userId,
    });
    if (!ownership) throw new ApiError(403, "You don't own this tool");

    const existing = await ReviewResponse.findOne({ reviewId });
    if (existing)
      throw new ApiError(409, "A response already exists for this review");

    return ReviewResponse.create({ reviewId, userId, content });
  },

  async updateOwnerResponse(reviewId: string, userId: string, content: string) {
    const response = await ReviewResponse.findOneAndUpdate(
      { reviewId, userId },
      { content },
      { new: true }
    );
    if (!response) throw new ApiError(404, "Response not found or not yours");
    return response;
  },

  async toggleHide(reviewId: string, hide: boolean, reason?: string) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isHidden: hide, hideReason: hide ? reason : null },
      { new: true }
    );
    if (!review) throw new ApiError(404, "Review not found");
    return review;
  },
};
