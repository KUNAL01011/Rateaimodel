import mongoose, { Document, Schema, Types } from "mongoose";

// ─── ToolAnalyticsDay ─────────────────────────────────────────────────────────
export interface IToolAnalyticsDay extends Document {
  toolId: Types.ObjectId;
  date: Date; // truncated to start-of-day
  pageViews: number;
  uniqueVisitors: number;
  recommAppearances: number; // times shown in recommender results
  recommClicks: number;      // times clicked from recommender
  reviewsReceived: number;
}

const ToolAnalyticsDaySchema = new Schema<IToolAnalyticsDay>({
  toolId: { type: Schema.Types.ObjectId, ref: "Tool", required: true, index: true },
  date: { type: Date, required: true, index: true },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  recommAppearances: { type: Number, default: 0 },
  recommClicks: { type: Number, default: 0 },
  reviewsReceived: { type: Number, default: 0 },
});

// One record per tool per day
ToolAnalyticsDaySchema.index({ toolId: 1, date: 1 }, { unique: true });

export const ToolAnalyticsDay = mongoose.model<IToolAnalyticsDay>(
  "ToolAnalyticsDay",
  ToolAnalyticsDaySchema
);

// ─── RecommendationCache ──────────────────────────────────────────────────────
export interface IRecommendationCache extends Document {
  inputHash: string;       // SHA256(task_description + filters JSON)
  taskDescription: string;
  filtersJson: string;
  intentJson: string;      // LLM-extracted intent
  resultsJson: string;     // full result set
  hitCount: number;
  expiresAt: Date;
  createdAt: Date;
}

const RecommendationCacheSchema = new Schema<IRecommendationCache>(
  {
    inputHash: { type: String, required: true, unique: true, index: true },
    taskDescription: { type: String, required: true },
    filtersJson: { type: String, required: true },
    intentJson: { type: String, required: true },
    resultsJson: { type: String, required: true },
    hitCount: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes expired cache docs
RecommendationCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RecommendationCache = mongoose.model<IRecommendationCache>(
  "RecommendationCache",
  RecommendationCacheSchema
);