import { RecommendationCache, Tool } from "@/models";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import crypto from "crypto";

interface RecommendFilters {
  max_price_per_month?: number;
  requires_api?: boolean;
  open_source_only?: boolean;
  language?: string;
  toolType?: string;
}

interface ExtractedIntent {
  task_type: string;
  domain: string;
  input_size?: string;
  requires_citation?: boolean;
  budget_sensitive?: boolean;
  primary_use_cases: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function extractIntent(
  taskDescription: string
): Promise<ExtractedIntent> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 1000,

      // 1. Force the model to output valid JSON
      responseMimeType: "application/json",

      // 2. Define the exact schema you want returned (Structured Outputs)
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          task_type: {
            type: SchemaType.STRING,
            description:
              "e.g. summarization, coding, image_generation, translation, analysis",
          },
          domain: {
            type: SchemaType.STRING,
            description:
              "e.g. academic, marketing, development, medical, legal, general",
          },
          input_size: {
            type: SchemaType.STRING,
            description: "short | medium | long | unknown",
          },
          requires_citation: {
            type: SchemaType.BOOLEAN,
          },
          budget_sensitive: {
            type: SchemaType.BOOLEAN,
          },
          primary_use_cases: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description:
              "array of use_case slugs from: coding_general, code_review, debugging, academic_research, citation_extraction, fact_checking, web_search, deep_research, copywriting, long_form_writing, creative_writing, summarization, translation, email_drafting, seo_content, image_generation, image_editing, image_analysis, text_to_speech, speech_to_text, data_analysis, document_processing, customer_support_bot, study_and_learning, brainstorming, legal_analysis, medical_information, financial_analysis, agentic_workflows",
          },
        },
        required: [
          "task_type",
          "domain",
          "input_size",
          "requires_citation",
          "budget_sensitive",
          "primary_use_cases",
        ],
      },
    },
  });

  const prompt = `Extract structured intent from this AI tool search query.\n\nQuery: "${taskDescription}"`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  return JSON.parse(responseText) as ExtractedIntent;
}

export const recommendationService = {
  getUseCaseTaxonomy() {
    return {
      development: [
        "coding_general",
        "code_review",
        "debugging",
        "app_building",
        "sql_and_data",
        "devops_and_infra",
      ],
      research: [
        "academic_research",
        "citation_extraction",
        "fact_checking",
        "web_search",
        "deep_research",
      ],
      writing: [
        "copywriting",
        "long_form_writing",
        "creative_writing",
        "summarization",
        "translation",
        "email_drafting",
        "seo_content",
      ],
      image: [
        "image_generation",
        "image_editing",
        "image_analysis",
        "logo_and_design",
      ],
      audio_video: [
        "text_to_speech",
        "speech_to_text",
        "voice_cloning",
        "music_generation",
        "video_generation",
        "video_editing",
      ],
      data_business: [
        "data_analysis",
        "spreadsheet_work",
        "document_processing",
        "customer_support_bot",
        "crm_and_sales",
      ],
      productivity: [
        "personal_assistant",
        "study_and_learning",
        "brainstorming",
      ],
      specialized: [
        "legal_analysis",
        "medical_information",
        "financial_analysis",
        "agentic_workflows",
      ],
    };
  },

  async recommend(
    taskDescription: string,
    filters: RecommendFilters = {},
    limit = 5
  ) {
    // Check cache (SHA256 of task + filters)
    const cacheKey = crypto
      .createHash("sha256")
      .update(taskDescription + JSON.stringify(filters))
      .digest("hex");

    const cached = await RecommendationCache.findOne({
      inputHash: cacheKey,
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      await RecommendationCache.findByIdAndUpdate(cached._id, {
        $inc: { hitCount: 1 },
      });
      return {
        intent: JSON.parse(cached.intentJson),
        recommendations: JSON.parse(cached.resultsJson),
        cached: true,
      };
    }

    // Extract intent with LLM (with keyword fallback)
    let intent: ExtractedIntent;
    try {
      intent = await extractIntent(taskDescription);
    } catch {
      // Fallback: keyword matching
      intent = {
        task_type: "general",
        domain: "general",
        primary_use_cases: [],
      };
    }

    // Build MongoDB query from intent + filters
    const toolFilter: Record<string, any> = { isDeprecated: false };

    if (intent.primary_use_cases?.length) {
      toolFilter["useCaseCoverage.useCase"] = { $in: intent.primary_use_cases };
    }
    if (filters.requires_api) toolFilter.hasApi = true;
    if (filters.open_source_only) toolFilter.isOpenSource = true;
    if (filters.toolType) toolFilter.toolType = filters.toolType;

    // Fetch candidates sorted by overall rating
    const candidates = await Tool.find(toolFilter)
      .populate("providerId", "name slug logoUrl")
      .sort({ ratingOverall: -1 })
      .limit(50);

    // Score each candidate
    const scored = candidates
      .map(tool => {
        let score = tool.ratingOverall ?? 0;

        // Boost if this use-case specifically has high score
        if (intent.primary_use_cases?.length) {
          const useCaseScore = tool.useCaseScores.find(u =>
            intent.primary_use_cases.includes(u.useCase)
          );
          if (useCaseScore) score = (score + useCaseScore.avgScore) / 2;
        }

        // Boost for review count (trust signal, log scale)
        score += Math.log10(Math.max(tool.reviewsCount, 1)) * 0.1;

        // Budget filter (apply after scoring to not miss good cheap tools)
        if (filters.max_price_per_month && tool.pricing?.proMonthlyUsd) {
          if (
            tool.pricing.proMonthlyUsd > filters.max_price_per_month &&
            !tool.hasFreeTier
          ) {
            return null;
          }
        }

        // Build match reason
        const useCaseScoreObj = tool.useCaseScores.find(u =>
          intent.primary_use_cases?.includes(u.useCase)
        );
        const matchReason = useCaseScoreObj
          ? `Rated ${useCaseScoreObj.avgScore.toFixed(1)}/5 for ${intent.task_type} by ${useCaseScoreObj.reviewCount} users.`
          : `Rated ${(tool.ratingOverall ?? 0).toFixed(1)}/5 overall by ${tool.reviewsCount} users.`;

        return {
          tool,
          score: parseFloat(score.toFixed(2)),
          matchReason,
          useCaseScore: useCaseScoreObj?.avgScore,
          reviewCountForUseCase: useCaseScoreObj?.reviewCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, limit)
      .map((item, i) => ({ rank: i + 1, ...item }));

    // Save to cache (6h TTL)
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
    await RecommendationCache.create({
      inputHash: cacheKey,
      taskDescription,
      filtersJson: JSON.stringify(filters),
      intentJson: JSON.stringify(intent),
      resultsJson: JSON.stringify(scored),
      expiresAt,
    }).catch(() => {}); // cache write failure is non-fatal

    return { intent, recommendations: scored, cached: false };
  },
};
