import mongoose, { Document, Schema, Types } from "mongoose";
import {
  TOOL_TYPES,
  PRICING_TYPES,
  MODALITIES,
  USE_CASES,
  VERIFICATION_STATUSES,
  ToolType,
  PricingType,
  VerificationStatus,
} from "./enums";

// ─── Embedded: Pricing ───────────────────────────────────────────────────────
interface IToolPricing {
  inputPricePerMillion?: number;
  outputPricePerMillion?: number;
  cachedInputDiscount?: number;
  freeMonthlyLimit?: string;
  proMonthlyUsd?: number;
  proYearlyUsd?: number;
  businessMonthlyUsd?: number;
  pricePerImage?: number;
  pricePerMinuteAudio?: number;
  pricePerMinuteVideo?: number;
  pricingNotes?: string;
  pricingUpdatedAt?: Date;
  pricingSourceUrl?: string;
}

const ToolPricingSchema = new Schema<IToolPricing>(
  {
    inputPricePerMillion: Number,
    outputPricePerMillion: Number,
    cachedInputDiscount: Number,
    freeMonthlyLimit: String,
    proMonthlyUsd: Number,
    proYearlyUsd: Number,
    businessMonthlyUsd: Number,
    pricePerImage: Number,
    pricePerMinuteAudio: Number,
    pricePerMinuteVideo: Number,
    pricingNotes: String,
    pricingUpdatedAt: Date,
    pricingSourceUrl: String,
  },
  { _id: false } // embedded sub-doc, no separate _id needed
);

// ─── Embedded: Modality entry ─────────────────────────────────────────────────
interface IToolModality {
  modality: (typeof MODALITIES)[number];
  isInput: boolean;
  isOutput: boolean;
}

const ToolModalitySchema = new Schema<IToolModality>(
  {
    modality: { type: String, enum: MODALITIES, required: true },
    isInput: { type: Boolean, default: true },
    isOutput: { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── Embedded: Use-case coverage ─────────────────────────────────────────────
interface IToolUseCase {
  useCase: (typeof USE_CASES)[number];
  confidence: number; // 1-5
}

const ToolUseCaseSchema = new Schema<IToolUseCase>(
  {
    useCase: { type: String, enum: USE_CASES, required: true },
    confidence: { type: Number, min: 1, max: 5, default: 3 },
  },
  { _id: false }
);

// ─── Embedded: Benchmark entry ────────────────────────────────────────────────
interface IToolBenchmark {
  benchmarkName: string;
  score: number;
  scoreUnit?: string;
  scoreDate?: Date;
  sourceUrl?: string;
  notes?: string;
  createdAt: Date;
}

const ToolBenchmarkSchema = new Schema<IToolBenchmark>(
  {
    benchmarkName: { type: String, required: true },
    score: { type: Number, required: true },
    scoreUnit: String,
    scoreDate: Date,
    sourceUrl: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Embedded: Use-case aggregate score ──────────────────────────────────────
interface IToolUseCaseScore {
  useCase: (typeof USE_CASES)[number];
  avgScore: number;
  reviewCount: number;
  lastRefreshed: Date;
}

const ToolUseCaseScoreSchema = new Schema<IToolUseCaseScore>(
  {
    useCase: { type: String, enum: USE_CASES, required: true },
    avgScore: { type: Number, required: true },
    reviewCount: { type: Number, required: true },
    lastRefreshed: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main Tool Document ───────────────────────────────────────────────────────
export interface ITool extends Document {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;

  toolType: ToolType;
  providerId?: Types.ObjectId;

  // Products built on top of models (e.g. Perplexity → Claude, GPT-4o)
  underlyingModelIds: Types.ObjectId[];

  modalities: IToolModality[];
  useCaseCoverage: IToolUseCase[];

  // Capability flags
  hasApi: boolean;
  isOpenSource: boolean;
  isOnHuggingFace: boolean;
  isSelfHostable: boolean;
  hasFreeTier: boolean;
  supportsFunctionCalling: boolean;
  supportsStreaming: boolean;
  supportsFineTuning: boolean;
  supportsMultimodal: boolean;

  // LLM-specific
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  trainingDataCutoff?: Date;
  modelFamily?: string;
  parameterCount?: string;
  quantizationOptions: string[];

  // Pricing
  pricingType: PricingType;
  pricing?: IToolPricing;

  // External links
  websiteUrl?: string;
  apiDocsUrl?: string;
  huggingFaceUrl?: string;
  githubUrl?: string;
  paperUrl?: string;

  // Media
  logoUrl?: string;
  screenshotUrls: string[];

  // Benchmarks (embedded array — one entry per benchmark name)
  benchmarks: IToolBenchmark[];

  // Community rating aggregates (denormalized, refreshed by job)
  ratingOverall?: number;
  ratingAccuracy?: number;
  ratingSpeed?: number;
  ratingCostValue?: number;
  ratingEaseOfUse?: number;
  reviewsCount: number;

  // Per-use-case aggregate scores (embedded, refreshed by job)
  useCaseScores: IToolUseCaseScore[];

  // Ownership / verification
  verificationStatus: VerificationStatus;

  // Editorial
  isFeatured: boolean;
  isDeprecated: boolean;
  deprecatedBy?: string;
  launchDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ToolSchema = new Schema<ITool>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 160 },
    fullDescription: String,

    toolType: { type: String, enum: TOOL_TYPES, required: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", index: true },

    underlyingModelIds: [{ type: Schema.Types.ObjectId, ref: "Tool" }],

    modalities: [ToolModalitySchema],
    useCaseCoverage: [ToolUseCaseSchema],

    // Capability flags
    hasApi: { type: Boolean, default: false, index: true },
    isOpenSource: { type: Boolean, default: false, index: true },
    isOnHuggingFace: { type: Boolean, default: false },
    isSelfHostable: { type: Boolean, default: false },
    hasFreeTier: { type: Boolean, default: false },
    supportsFunctionCalling: { type: Boolean, default: false },
    supportsStreaming: { type: Boolean, default: false },
    supportsFineTuning: { type: Boolean, default: false },
    supportsMultimodal: { type: Boolean, default: false },

    // LLM-specific
    contextWindowTokens: Number,
    maxOutputTokens: Number,
    trainingDataCutoff: Date,
    modelFamily: String,
    parameterCount: String,
    quantizationOptions: [String],

    // Pricing
    pricingType: { type: String, enum: PRICING_TYPES, required: true, index: true },
    pricing: ToolPricingSchema,

    // External links
    websiteUrl: String,
    apiDocsUrl: String,
    huggingFaceUrl: String,
    githubUrl: String,
    paperUrl: String,

    // Media
    logoUrl: String,
    screenshotUrls: [String],

    // Benchmarks
    benchmarks: [ToolBenchmarkSchema],

    // Community rating aggregates
    ratingOverall: { type: Number, index: true },
    ratingAccuracy: Number,
    ratingSpeed: Number,
    ratingCostValue: Number,
    ratingEaseOfUse: Number,
    reviewsCount: { type: Number, default: 0, index: true },

    // Per-use-case scores
    useCaseScores: [ToolUseCaseScoreSchema],

    // Ownership / verification
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "unverified",
    },

    // Editorial
    isFeatured: { type: Boolean, default: false },
    isDeprecated: { type: Boolean, default: false },
    deprecatedBy: String,
    launchDate: Date,
  },
  { timestamps: true }
);

// Compound index: find all tools for a use-case sorted by score
ToolSchema.index({ "useCaseScores.useCase": 1, "useCaseScores.avgScore": -1 });

export const Tool = mongoose.model<ITool>("Tool", ToolSchema);