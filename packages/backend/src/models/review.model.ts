import mongoose, { Document, Schema, Types } from "mongoose";
import { USE_CASES, VOTE_TYPES, UseCase, VoteType } from "./enums";

// ─── Review ───────────────────────────────────────────────────────────────────
export interface IReview extends Document {
  toolId: Types.ObjectId;
  userId: Types.ObjectId;
  useCase: UseCase;

  // Structured ratings (1-5)
  ratingOverall: number;
  ratingAccuracy?: number;
  ratingSpeed?: number;
  ratingCostValue?: number;
  ratingEaseOfUse?: number;
  ratingUseCaseFit?: number;

  // Written review
  reviewText: string; // min 50 chars enforced in app layer
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;

  // Badges & community signals
  isVerifiedUsage: boolean;
  upvotes: number;
  downvotes: number;

  // Moderation
  isHidden: boolean;
  hideReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    toolId: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    useCase: { type: String, enum: USE_CASES, required: true, index: true },

    ratingOverall: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    ratingAccuracy: { type: Number, min: 1, max: 5 },
    ratingSpeed: { type: Number, min: 1, max: 5 },
    ratingCostValue: { type: Number, min: 1, max: 5 },
    ratingEaseOfUse: { type: Number, min: 1, max: 5 },
    ratingUseCaseFit: { type: Number, min: 1, max: 5 },

    reviewText: { type: String, required: true },
    pros: String,
    cons: String,
    wouldRecommend: { type: Boolean, required: true },

    isVerifiedUsage: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },

    isHidden: { type: Boolean, default: false },
    hideReason: String,
  },
  { timestamps: true }
);

// One review per user per tool per use-case
ReviewSchema.index({ userId: 1, toolId: 1, useCase: 1 }, { unique: true });
ReviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);

// ─── ReviewVote ───────────────────────────────────────────────────────────────
export interface IReviewVote extends Document {
  reviewId: Types.ObjectId;
  userId: Types.ObjectId;
  voteType: VoteType;
  createdAt: Date;
}

const ReviewVoteSchema = new Schema<IReviewVote>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    voteType: { type: String, enum: VOTE_TYPES, required: true },
  },
  { timestamps: true }
);

// One vote per user per review
ReviewVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export const ReviewVote = mongoose.model<IReviewVote>(
  "ReviewVote",
  ReviewVoteSchema
);

// ─── ReviewResponse ───────────────────────────────────────────────────────────
export interface IReviewResponse extends Document {
  reviewId: Types.ObjectId; // unique — one response per review
  userId: Types.ObjectId; // must be a verified tool owner
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewResponseSchema = new Schema<IReviewResponse>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      unique: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const ReviewResponse = mongoose.model<IReviewResponse>(
  "ReviewResponse",
  ReviewResponseSchema
);
