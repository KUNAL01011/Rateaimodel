import mongoose from "mongoose";
import { Provider, Tool } from "@/models";
import {
  PRICING_TYPES,
  TOOL_TYPES,
  USE_CASES,
  type Modality,
  type PricingType,
  type ToolType,
  type UseCase,
} from "@/models";

/**
 * Shared spreadsheet → Tool mapping.
 *
 * The admin bulk-import endpoint and the one-off `seed.ts` script both run
 * through this module so the two never drift. Input rows use the human-readable
 * column headers exported from the AI Tools spreadsheet (e.g. "Short Description",
 * "Modalities (Input)"), and are converted to the strict enum/typed shape the
 * Tool model expects. Unknown enum labels (modalities, use-cases) are dropped
 * rather than failing the row; a row only fails on a missing/invalid *required*
 * field.
 */

export type ImportRow = Record<string, unknown>;

// ─── Primitive coercion helpers ───────────────────────────────────────────────
const str = (v: unknown): string => String(v ?? "").trim();

const isBlank = (v: unknown): boolean => str(v) === "";

const yesNo = (v: unknown): boolean => {
  const s = str(v).toLowerCase();
  return s === "yes" || s === "true" || s === "1" || s === "y";
};

const num = (v: unknown): number | undefined => {
  if (isBlank(v)) return undefined;
  const n = Number(String(v).replace(/[,$]/g, "").trim());
  return Number.isFinite(n) ? n : undefined;
};

/** Parse a loose date like "2024", "2024-04" or "2024-04-15" into an ISO string. */
const isoDate = (v: unknown): string | undefined => {
  const s = str(v);
  if (!s) return undefined;
  let normalized = s;
  if (/^\d{4}$/.test(s)) normalized = `${s}-01-01`;
  else if (/^\d{4}-\d{1,2}$/.test(s)) {
    const [y, m] = s.split("-");
    normalized = `${y}-${m.padStart(2, "0")}-01`;
  }
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ─── Enum mapping ──────────────────────────────────────────────────────────────
const TOOL_TYPE_ALIASES: Record<string, ToolType> = {
  llm: "llm_model",
  "llm model": "llm_model",
  "language model": "llm_model",
  chat: "chat_product",
  "chat product": "chat_product",
  search: "search_product",
  "search product": "search_product",
  code: "coding_tool",
  coding: "coding_tool",
  "coding tool": "coding_tool",
  image: "image_model",
  "image model": "image_model",
  video: "video_model",
  "video model": "video_model",
  audio: "audio_model",
  "audio model": "audio_model",
  embedding: "embedding_model",
  "embedding model": "embedding_model",
  embeddings: "embedding_model",
  agent: "agent_framework",
  "agent framework": "agent_framework",
  multimodal: "multimodal_tool",
  "multimodal tool": "multimodal_tool",
  "open source": "open_source_model",
  "open source model": "open_source_model",
};

const mapToolType = (v: unknown): ToolType | undefined => {
  const s = str(v).toLowerCase();
  if (!s) return undefined;
  if ((TOOL_TYPES as readonly string[]).includes(s)) return s as ToolType;
  return TOOL_TYPE_ALIASES[s];
};

const mapPricingType = (v: unknown): PricingType | undefined => {
  const s = str(v).toLowerCase();
  if (!s) return undefined;
  if ((PRICING_TYPES as readonly string[]).includes(s)) return s as PricingType;
  if (s.includes("open") && s.includes("free")) return "open_source_free";
  if (s.includes("free")) return "free";
  if (s.includes("freemium")) return "freemium";
  if (s.includes("token")) return "pay_per_token";
  if (s.includes("enterprise")) return "enterprise";
  if (s.includes("pay")) return "pay_per_use";
  if (s.includes("paid") || s.includes("sub")) return "subscription";
  return undefined;
};

const MODALITY_ALIASES: Record<string, Modality> = {
  text: "text",
  image: "image",
  images: "image",
  vision: "image",
  audio: "audio",
  speech: "audio",
  video: "video",
  code: "code",
  embeddings: "embeddings",
  embedding: "embeddings",
  documents: "documents",
  document: "documents",
  docs: "documents",
  "structured data": "structured_data",
  structured_data: "structured_data",
};

const parseModalityList = (v: unknown): Modality[] => {
  if (isBlank(v)) return [];
  return str(v)
    .split(/[,;/|]/)
    .map(x => MODALITY_ALIASES[x.trim().toLowerCase()])
    .filter((x): x is Modality => Boolean(x));
};

// Loose spreadsheet use-case labels → fine-grained enum slugs (best effort).
const USE_CASE_KEYWORDS: [RegExp, UseCase][] = [
  [/code review/, "code_review"],
  [/debug/, "debugging"],
  [/app build|app-build|build app/, "app_building"],
  [/sql|database/, "sql_and_data"],
  [/devops|infra/, "devops_and_infra"],
  [/cod(e|ing)|program|develop/, "coding_general"],
  [/citation/, "citation_extraction"],
  [/fact.?check/, "fact_checking"],
  [/deep research/, "deep_research"],
  [/academ|research/, "academic_research"],
  [/web search|search/, "web_search"],
  [/copywrit/, "copywriting"],
  [/creative/, "creative_writing"],
  [/seo/, "seo_content"],
  [/email/, "email_drafting"],
  [/translat/, "translation"],
  [/summar/, "summarization"],
  [/writ|content/, "long_form_writing"],
  [/logo|design/, "logo_and_design"],
  [/image edit/, "image_editing"],
  [/image gen|image creat/, "image_generation"],
  [/vision|image anal|image/, "image_analysis"],
  [/text.?to.?speech|tts/, "text_to_speech"],
  [/speech.?to.?text|transcri|stt/, "speech_to_text"],
  [/voice clon|voice/, "voice_cloning"],
  [/music/, "music_generation"],
  [/video edit/, "video_editing"],
  [/video/, "video_generation"],
  [/spreadsheet|excel/, "spreadsheet_work"],
  [/document process|pdf|doc process/, "document_processing"],
  [/customer support|support bot|chatbot/, "customer_support_bot"],
  [/crm|sales/, "crm_and_sales"],
  [/data|analytic|analysis/, "data_analysis"],
  [/assistant|personal/, "personal_assistant"],
  [/study|learn|education|tutor/, "study_and_learning"],
  [/brainstorm|idea/, "brainstorming"],
  [/legal|law/, "legal_analysis"],
  [/medical|health/, "medical_information"],
  [/financ|invest/, "financial_analysis"],
  [/agent/, "agentic_workflows"],
];

const mapUseCase = (label: string): UseCase | undefined => {
  const s = label.trim().toLowerCase();
  if (!s) return undefined;
  if ((USE_CASES as readonly string[]).includes(s)) return s as UseCase;
  for (const [re, uc] of USE_CASE_KEYWORDS) {
    if (re.test(s)) return uc;
  }
  return undefined;
};

const parseUseCases = (v: unknown): { useCase: UseCase; confidence: number }[] => {
  if (isBlank(v)) return [];
  const seen = new Set<UseCase>();
  const out: { useCase: UseCase; confidence: number }[] = [];
  for (const part of str(v).split(/[,;/|]/)) {
    const uc = mapUseCase(part);
    if (uc && !seen.has(uc)) {
      seen.add(uc);
      out.push({ useCase: uc, confidence: 3 });
    }
  }
  return out;
};

// ─── Row → Tool payload ────────────────────────────────────────────────────────
export interface MappedRow {
  providerName: string;
  payload: Record<string, any>;
  errors: string[];
}

/**
 * Convert one spreadsheet row into a Tool payload (minus providerId, which the
 * caller resolves). Returns `errors` for any missing/invalid required fields.
 * Only columns that carry a value are included, so blank cells never overwrite
 * existing data on update.
 */
export function mapRowToToolPayload(row: ImportRow): MappedRow {
  const errors: string[] = [];
  const get = (key: string) => row[key];

  const name = str(get("Name"));
  if (!name) errors.push("Missing Name");

  const slug = str(get("Slug")) || (name ? slugify(name) : "");
  if (!slug) errors.push("Missing Slug");

  const shortDescription = str(get("Short Description")).slice(0, 160);
  if (!shortDescription) errors.push("Missing Short Description");

  const toolType = mapToolType(get("Tool Type"));
  if (!toolType) errors.push(`Unknown Tool Type "${str(get("Tool Type"))}"`);

  const pricingType = mapPricingType(get("Pricing Type"));
  if (!pricingType)
    errors.push(`Unknown Pricing Type "${str(get("Pricing Type"))}"`);

  const payload: Record<string, any> = { slug, name };

  if (shortDescription) payload.shortDescription = shortDescription;
  const fullDescription = str(get("Full Description"));
  if (fullDescription) payload.fullDescription = fullDescription;
  if (toolType) payload.toolType = toolType;
  if (pricingType) payload.pricingType = pricingType;

  // Capability flags — only set when the column is present (non-blank)
  const flag = (col: string, field: string) => {
    if (!isBlank(get(col))) payload[field] = yesNo(get(col));
  };
  flag("Has Free Tier", "hasFreeTier");
  flag("Has API", "hasApi");
  flag("Open Source", "isOpenSource");
  flag("Self-Hostable", "isSelfHostable");
  flag("Function Calling", "supportsFunctionCalling");
  flag("Streaming", "supportsStreaming");
  flag("Fine-Tuning", "supportsFineTuning");
  flag("Multimodal", "supportsMultimodal");

  // LLM specifics
  const ctxK = num(get("Context Window (K tokens)"));
  if (ctxK !== undefined) payload.contextWindowTokens = Math.round(ctxK * 1000);
  const maxOut = num(get("Max Output Tokens"));
  if (maxOut !== undefined) payload.maxOutputTokens = Math.round(maxOut);
  const modelFamily = str(get("Model Family"));
  if (modelFamily) payload.modelFamily = modelFamily;
  const paramCount = str(get("Parameter Count"));
  if (paramCount) payload.parameterCount = paramCount;
  const trainingCutoff = isoDate(get("Training Cutoff"));
  if (trainingCutoff) payload.trainingDataCutoff = trainingCutoff;

  // Modalities (merge input + output into one array of entries)
  const inputs = parseModalityList(get("Modalities (Input)"));
  const outputs = parseModalityList(get("Modalities (Output)"));
  const allMods = new Set<Modality>([...inputs, ...outputs]);
  if (allMods.size) {
    payload.modalities = Array.from(allMods).map(modality => ({
      modality,
      isInput: inputs.includes(modality),
      isOutput: outputs.includes(modality),
    }));
  }

  // Use cases
  const useCaseCoverage = parseUseCases(get("Use Cases"));
  if (useCaseCoverage.length) payload.useCaseCoverage = useCaseCoverage;

  // Links
  const website = str(get("Website"));
  if (website) payload.websiteUrl = website;
  const repo = str(get("GitHub / HuggingFace"));
  if (repo) {
    if (repo.toLowerCase().includes("huggingface")) payload.huggingFaceUrl = repo;
    else if (repo.toLowerCase().includes("github")) payload.githubUrl = repo;
  }

  // Pricing sub-document
  const pricing: Record<string, any> = {};
  const priceIn = num(get("Price Input ($/M tokens)"));
  if (priceIn !== undefined) pricing.inputPricePerMillion = priceIn;
  const priceOut = num(get("Price Output ($/M tokens)"));
  if (priceOut !== undefined) pricing.outputPricePerMillion = priceOut;
  const proMonthly = num(get("Pro Monthly (USD)"));
  if (proMonthly !== undefined) pricing.proMonthlyUsd = proMonthly;
  const pricingNotes = str(get("Pricing Notes"));
  if (pricingNotes) pricing.pricingNotes = pricingNotes;
  if (Object.keys(pricing).length) payload.pricing = pricing;

  // Editorial
  const launchDate = isoDate(get("Launch Date"));
  if (launchDate) payload.launchDate = launchDate;
  if (!isBlank(get("Deprecated"))) payload.isDeprecated = yesNo(get("Deprecated"));
  if (!isBlank(get("Featured"))) payload.isFeatured = yesNo(get("Featured"));
  const verification = str(get("Verification")).toLowerCase();
  if (verification === "verified" || verification === "claimed")
    payload.verificationStatus = verification;

  return {
    providerName: str(get("Provider")) || "Unknown Provider",
    payload,
    errors,
  };
}

// ─── Provider resolution ───────────────────────────────────────────────────────
async function resolveProvider(
  name: string,
  cache: Map<string, mongoose.Types.ObjectId>,
  isOpenSource: boolean
): Promise<mongoose.Types.ObjectId> {
  const cached = cache.get(name);
  if (cached) return cached;

  const slug = slugify(name);
  const existing = await Provider.findOne({ slug });
  if (existing) {
    cache.set(name, existing._id as mongoose.Types.ObjectId);
    return existing._id as mongoose.Types.ObjectId;
  }
  const created = await Provider.create({ name, slug, isOpenSource });
  cache.set(name, created._id as mongoose.Types.ObjectId);
  return created._id as mongoose.Types.ObjectId;
}

// ─── Bulk import ───────────────────────────────────────────────────────────────
export interface BulkRowResult {
  row: number; // 1-based row index in the uploaded file
  slug: string;
  name: string;
  status: "created" | "updated" | "failed";
  error?: string;
}

export interface BulkImportReport {
  total: number;
  created: number;
  updated: number;
  failed: number;
  results: BulkRowResult[];
}

export const importService = {
  mapRowToToolPayload,

  /**
   * Validate + upsert many spreadsheet rows. Tools are matched by slug:
   * existing tools are updated (only with the columns present in the row),
   * new tools are created. Each row is processed independently so one bad
   * row never aborts the batch.
   */
  async bulkImport(rows: ImportRow[]): Promise<BulkImportReport> {
    const providerCache = new Map<string, mongoose.Types.ObjectId>();
    const results: BulkRowResult[] = [];
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const { providerName, payload, errors } = mapRowToToolPayload(rows[i]);

      if (errors.length) {
        failed++;
        results.push({
          row: rowNum,
          slug: payload.slug ?? "",
          name: payload.name ?? "",
          status: "failed",
          error: errors.join("; "),
        });
        continue;
      }

      try {
        payload.providerId = await resolveProvider(
          providerName,
          providerCache,
          payload.isOpenSource === true
        );

        const res = await Tool.findOneAndUpdate(
          { slug: payload.slug },
          { $set: payload },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
            includeResultMetadata: true,
          }
        );

        const wasUpdate =
          (res.lastErrorObject as any)?.updatedExisting === true;
        if (wasUpdate) updated++;
        else created++;

        results.push({
          row: rowNum,
          slug: payload.slug,
          name: payload.name,
          status: wasUpdate ? "updated" : "created",
        });
      } catch (err: any) {
        failed++;
        results.push({
          row: rowNum,
          slug: payload.slug ?? "",
          name: payload.name ?? "",
          status: "failed",
          error: err?.message ?? "Write failed",
        });
      }
    }

    return { total: rows.length, created, updated, failed, results };
  },
};
