import {z} from "zod";
import { TOOL_TYPES,PRICING_TYPES,MODALITIES,USE_CASES } from "@/models";

const toolModalitySchema = z.object({
  modality: z.enum(MODALITIES),
  isInput: z.boolean().optional(),
  isOutput: z.boolean().optional(),
});

const toolUseCaseSchema = z.object({
  useCase: z.enum(USE_CASES),
  confidence: z.number().int().min(1).max(5).optional(),
});

const toolPricingSchema = z.object({
  inputPricePerMillion: z.number().optional(),
  outputPricePerMillion: z.number().optional(),
  cachedInputDiscount: z.number().optional(),
  freeMonthlyLimit: z.string().optional(),
  proMonthlyUsd: z.number().optional(),
  proYearlyUsd: z.number().optional(),
  businessMonthlyUsd: z.number().optional(),
  pricePerImage: z.number().optional(),
  pricePerMinuteAudio: z.number().optional(),
  pricePerMinuteVideo: z.number().optional(),
  pricingNotes: z.string().optional(),
  pricingUpdatedAt: z.string().datetime().optional(),
  pricingSourceUrl: z.string().url().optional(),
}).optional();

export const createToolSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortDescription: z.string().min(1).max(160),
  fullDescription: z.string().optional(),
  toolType: z.enum(TOOL_TYPES),
  providerId: z.string().optional(),
  underlyingModelIds: z.array(z.string()).optional(),
  modalities: z.array(toolModalitySchema).optional(),
  useCaseCoverage: z.array(toolUseCaseSchema).optional(),
  hasApi: z.boolean().optional(),
  isOpenSource: z.boolean().optional(),
  isOnHuggingFace: z.boolean().optional(),
  isSelfHostable: z.boolean().optional(),
  hasFreeTier: z.boolean().optional(),
  supportsFunctionCalling: z.boolean().optional(),
  supportsStreaming: z.boolean().optional(),
  supportsFineTuning: z.boolean().optional(),
  supportsMultimodal: z.boolean().optional(),
  contextWindowTokens: z.number().int().optional(),
  maxOutputTokens: z.number().int().optional(),
  trainingDataCutoff: z.string().datetime().optional(),
  modelFamily: z.string().optional(),
  parameterCount: z.string().optional(),
  quantizationOptions: z.array(z.string()).optional(),
  pricingType: z.enum(PRICING_TYPES),
  pricing: toolPricingSchema,
  websiteUrl: z.string().url().optional(),
  apiDocsUrl: z.string().url().optional(),
  huggingFaceUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  paperUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  screenshotUrls: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
  launchDate: z.string().datetime().optional(),
});
 
export const updateToolSchema = createToolSchema.partial();
 
export const toolQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  toolType: z.string().optional(),
  use_case: z.string().optional(),
  pricing: z.string().optional(),
  has_api: z.string().optional(),
  open_source: z.string().optional(),
  sort: z.enum(["rating", "reviews_count", "newest", "name"]).optional(),
  q: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
 
export const addBenchmarkSchema = z.object({
  benchmarkName: z.string().min(1),
  score: z.number(),
  scoreUnit: z.string().optional(),
  scoreDate: z.string().datetime().optional(),
  sourceUrl: z.string().url().optional(),
  notes: z.string().optional(),
});