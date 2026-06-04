/**
 * seed.ts — RateAI Database Seeder
 *
 * Usage:
 *   npx tsx src/seed.ts
 *   npx tsx src/seed.ts --fresh   (drops existing data first)
 *
 * Place this file at: packages/backend/src/seed.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Inline minimal model imports (avoids path alias issues when run directly) ──
import { connectDB, disconnectDB } from "../configs/database.config";
import { Provider, Tool, User, Review, SavedTool } from "../models";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROVIDERS
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    name: "Anthropic",
    slug: "anthropic",
    description:
      "AI safety company building reliable, interpretable, and steerable AI systems. Creators of the Claude model family.",
    website: "https://anthropic.com",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2021,
  },
  {
    name: "OpenAI",
    slug: "openai",
    description:
      "AI research laboratory and deployment company. Creators of GPT series, DALL-E, Whisper, and Sora.",
    website: "https://openai.com",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2015,
  },
  {
    name: "Google DeepMind",
    slug: "google-deepmind",
    description:
      "Google's AI research lab formed from the merger of DeepMind and Google Brain. Creators of Gemini.",
    website: "https://deepmind.google",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
    isOpenSource: false,
    hqCountry: "GB",
    foundedYear: 2010,
  },
  {
    name: "Meta AI",
    slug: "meta-ai",
    description:
      "Meta's fundamental AI research lab, committed to open-source AI. Creators of the LLaMA model series.",
    website: "https://ai.meta.com",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
    isOpenSource: true,
    hqCountry: "US",
    foundedYear: 2003,
  },
  {
    name: "Mistral AI",
    slug: "mistral-ai",
    description:
      "European AI company building open and efficient frontier models. Known for strong performance-per-parameter.",
    website: "https://mistral.ai",
    logoUrl: "https://avatars.githubusercontent.com/u/132372032",
    isOpenSource: true,
    hqCountry: "FR",
    foundedYear: 2023,
  },
  {
    name: "Midjourney Inc.",
    slug: "midjourney",
    description:
      "Independent research lab exploring new mediums of thought through AI image generation.",
    website: "https://midjourney.com",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2022,
  },
  {
    name: "Stability AI",
    slug: "stability-ai",
    description:
      "Activating humanity's potential through open AI. Creators of Stable Diffusion.",
    website: "https://stability.ai",
    logoUrl: "https://avatars.githubusercontent.com/u/100950301",
    isOpenSource: true,
    hqCountry: "GB",
    foundedYear: 2020,
  },
  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    description:
      "Research and development company focused on natural-sounding AI voice synthesis and cloning.",
    website: "https://elevenlabs.io",
    logoUrl: "https://elevenlabs.io/favicon.ico",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2022,
  },
  {
    name: "Runway AI Inc.",
    slug: "runway",
    description:
      "Applied AI research for the creative industries. Pioneers of text-to-video generation.",
    website: "https://runwayml.com",
    logoUrl: "https://runwayml.com/favicon.ico",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2018,
  },
  {
    name: "Perplexity AI",
    slug: "perplexity-ai",
    description:
      "Building the most trusted source of knowledge and information in the world via AI-powered search.",
    website: "https://perplexity.ai",
    logoUrl: "https://www.perplexity.ai/favicon.ico",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2022,
  },
  {
    name: "Anysphere",
    slug: "anysphere",
    description:
      "Building the world's most productive software development environment with Cursor IDE.",
    website: "https://cursor.sh",
    logoUrl: "https://cursor.sh/apple-touch-icon.png",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2022,
  },
  {
    name: "Suno AI",
    slug: "suno-ai",
    description:
      "Making music creation accessible to everyone through AI music generation.",
    website: "https://suno.ai",
    logoUrl: "https://suno.com/favicon.ico",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2023,
  },
  {
    name: "Udio",
    slug: "udio",
    description:
      "AI music generation platform turning text prompts into studio-quality tracks.",
    website: "https://udio.com",
    logoUrl: "https://www.udio.com/favicon.ico",
    isOpenSource: false,
    hqCountry: "US",
    foundedYear: 2023,
  },
  {
    name: "Significant Gravitas",
    slug: "significant-gravitas",
    description:
      "Building the open-source backbone of autonomous AI agents with AutoGPT.",
    website: "https://agpt.co",
    logoUrl: "https://auto-gpt.ai/favicon.ico",
    isOpenSource: true,
    hqCountry: "US",
    foundedYear: 2023,
  },
  {
    name: "Cohere",
    slug: "cohere",
    description:
      "Enterprise-focused NLP platform providing embeddings, reranking, and generation models.",
    website: "https://cohere.com",
    logoUrl: "https://cohere.com/favicon.ico",
    isOpenSource: false,
    hqCountry: "CA",
    foundedYear: 2019,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. TOOLS  (20 tools across all 11 tool types)
// ─────────────────────────────────────────────────────────────────────────────

// Helper to build the tools array after provider IDs are known
function buildTools(providerMap: Record<string, mongoose.Types.ObjectId>) {
  return [
    // ── llm_model (4) ──────────────────────────────────────────────────────
    {
      slug: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      shortDescription:
        "Anthropic's most intelligent model — blazing fast with a 200K context window.",
      fullDescription:
        "Claude 3.5 Sonnet combines top-tier intelligence with exceptional speed, making it the ideal choice for complex reasoning, nuanced writing, multi-step coding, and deep analysis. With a 200K token context window, it handles entire codebases or research corpora in a single pass. Benchmark leader on MMLU, HumanEval, and MATH, while delivering sub-second first-token latency.",
      toolType: "llm_model",
      providerId: providerMap["anthropic"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "image", isInput: true, isOutput: false },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 5 },
        { useCase: "code_review", confidence: 5 },
        { useCase: "long_form_writing", confidence: 5 },
        { useCase: "academic_research", confidence: 5 },
        { useCase: "summarization", confidence: 5 },
        { useCase: "data_analysis", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsMultimodal: true,
      contextWindowTokens: 200000,
      maxOutputTokens: 8192,
      modelFamily: "Claude 3.5",
      pricingType: "pay_per_token",
      pricing: {
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
        pricingNotes: "$3/M input · $15/M output",
      },
      websiteUrl: "https://claude.ai",
      apiDocsUrl: "https://docs.anthropic.com",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg",
      benchmarks: [
        {
          benchmarkName: "MMLU",
          score: 88.7,
          scoreUnit: "%",
          notes: "Expert-level reasoning",
        },
        {
          benchmarkName: "HumanEval",
          score: 92.0,
          scoreUnit: "%",
          notes: "Code generation",
        },
        {
          benchmarkName: "MATH",
          score: 71.1,
          scoreUnit: "%",
          notes: "Mathematical reasoning",
        },
      ],
      ratingOverall: 4.8,
      ratingAccuracy: 4.9,
      ratingSpeed: 4.6,
      ratingCostValue: 4.2,
      ratingEaseOfUse: 4.8,
      reviewsCount: 4821,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "gpt-4o",
      name: "GPT-4o",
      shortDescription:
        "OpenAI's flagship omni model — natively multimodal and blazing fast.",
      fullDescription:
        "GPT-4o delivers GPT-4-level intelligence at 2× the speed and half the price. Natively processes text, audio, image, and video inputs, making it the go-to for production deployments. Industry-leading vision capabilities and the most robust function-calling ecosystem in the market.",
      toolType: "llm_model",
      providerId: providerMap["openai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "image", isInput: true, isOutput: false },
        { modality: "audio", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 5 },
        { useCase: "image_analysis", confidence: 5 },
        { useCase: "customer_support_bot", confidence: 4 },
        { useCase: "translation", confidence: 5 },
        { useCase: "summarization", confidence: 5 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsMultimodal: true,
      contextWindowTokens: 128000,
      maxOutputTokens: 16384,
      modelFamily: "GPT-4",
      pricingType: "pay_per_token",
      pricing: {
        inputPricePerMillion: 5,
        outputPricePerMillion: 15,
        pricingNotes: "$5/M input · $15/M output",
      },
      websiteUrl: "https://openai.com/gpt-4o",
      apiDocsUrl: "https://platform.openai.com/docs",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
      benchmarks: [
        { benchmarkName: "MMLU", score: 88.7, scoreUnit: "%" },
        { benchmarkName: "HumanEval", score: 90.2, scoreUnit: "%" },
        { benchmarkName: "MATH", score: 76.6, scoreUnit: "%" },
      ],
      ratingOverall: 4.7,
      ratingAccuracy: 4.7,
      ratingSpeed: 4.9,
      ratingCostValue: 4.5,
      ratingEaseOfUse: 4.8,
      reviewsCount: 9312,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "gemini-1-5-pro",
      name: "Gemini 1.5 Pro",
      shortDescription:
        "Google's million-token context model — entire codebases, hour-long videos in one pass.",
      fullDescription:
        "Gemini 1.5 Pro introduces a 1 million token context window — enough to process an entire codebase, a full movie transcript, or thousands of documents simultaneously. Outperforms rivals on long-context tasks, video understanding, and multi-document reasoning.",
      toolType: "llm_model",
      providerId: providerMap["google-deepmind"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "image", isInput: true, isOutput: false },
        { modality: "video", isInput: true, isOutput: false },
        { modality: "audio", isInput: true, isOutput: false },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "document_processing", confidence: 5 },
        { useCase: "academic_research", confidence: 5 },
        { useCase: "summarization", confidence: 5 },
        { useCase: "coding_general", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsMultimodal: true,
      contextWindowTokens: 1000000,
      maxOutputTokens: 8192,
      modelFamily: "Gemini 1.5",
      pricingType: "pay_per_token",
      pricing: {
        inputPricePerMillion: 3.5,
        outputPricePerMillion: 10.5,
      },
      websiteUrl: "https://gemini.google.com",
      apiDocsUrl: "https://ai.google.dev/docs",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
      benchmarks: [
        { benchmarkName: "MMLU", score: 83.7, scoreUnit: "%" },
        { benchmarkName: "Video Understanding", score: 91.4, scoreUnit: "%" },
      ],
      ratingOverall: 4.5,
      ratingAccuracy: 4.6,
      ratingSpeed: 4.4,
      ratingCostValue: 4.7,
      ratingEaseOfUse: 4.3,
      reviewsCount: 4203,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "llama-3-1-70b",
      name: "Llama 3.1 70B",
      shortDescription:
        "Meta's frontier open-source LLM — yours to deploy, fine-tune, and own.",
      fullDescription:
        "Meta's Llama 3.1 70B matches proprietary models on most benchmarks while giving developers complete control. Deploy on your own infrastructure, fine-tune on your domain data, no usage fees, no vendor lock-in. Available via Groq, Together AI, Replicate, and more.",
      toolType: "llm_model",
      providerId: providerMap["meta-ai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 4 },
        { useCase: "long_form_writing", confidence: 4 },
        { useCase: "summarization", confidence: 4 },
        { useCase: "agentic_workflows", confidence: 3 },
      ],
      hasApi: true,
      isOpenSource: true,
      hasFreeTier: true,
      isSelfHostable: true,
      supportsFineTuning: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      contextWindowTokens: 128000,
      maxOutputTokens: 8192,
      modelFamily: "LLaMA 3",
      pricingType: "open_source_free",
      pricing: { pricingNotes: "Free weights — pay only for hosting" },
      websiteUrl: "https://llama.meta.com",
      apiDocsUrl: "https://llama.meta.com/docs",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
      benchmarks: [
        { benchmarkName: "MMLU", score: 82.0, scoreUnit: "%" },
        { benchmarkName: "HumanEval", score: 80.5, scoreUnit: "%" },
      ],
      ratingOverall: 4.6,
      ratingAccuracy: 4.5,
      ratingSpeed: 4.7,
      ratingCostValue: 5.0,
      ratingEaseOfUse: 3.8,
      reviewsCount: 7820,
      isFeatured: false,
      verificationStatus: "verified",
    },

    // ── chat_product (2) ───────────────────────────────────────────────────
    {
      slug: "chatgpt",
      name: "ChatGPT",
      shortDescription:
        "The world's most-used AI assistant — conversational, capable, and constantly improving.",
      fullDescription:
        "ChatGPT is OpenAI's consumer AI assistant powering 100M+ monthly users. It handles writing, coding, research, image generation (via DALL-E), data analysis with Code Interpreter, and web browsing in one seamless interface. The Plus plan unlocks GPT-4o and all plugins.",
      toolType: "chat_product",
      providerId: providerMap["openai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "image", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "brainstorming", confidence: 5 },
        { useCase: "copywriting", confidence: 4 },
        { useCase: "study_and_learning", confidence: 5 },
        { useCase: "email_drafting", confidence: 5 },
        { useCase: "customer_support_bot", confidence: 4 },
      ],
      hasApi: false,
      isOpenSource: false,
      hasFreeTier: true,
      supportsMultimodal: true,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "Limited GPT-3.5 usage",
        proMonthlyUsd: 20,
        pricingNotes: "Free · Plus $20/mo · Team $30/user/mo",
      },
      websiteUrl: "https://chat.openai.com",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
      ratingOverall: 4.6,
      ratingAccuracy: 4.5,
      ratingSpeed: 4.8,
      ratingCostValue: 4.5,
      ratingEaseOfUse: 4.9,
      reviewsCount: 18420,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "mistral-le-chat",
      name: "Le Chat",
      shortDescription:
        "Mistral's free-tier chat assistant — fast, private, and European.",
      fullDescription:
        "Le Chat is Mistral AI's consumer-facing assistant. Powered by Mistral Large 2, it offers fast responses, a multilingual edge (especially French and European languages), and a clean interface. Free tier is generous; Pro unlocks web search and document analysis.",
      toolType: "chat_product",
      providerId: providerMap["mistral-ai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "brainstorming", confidence: 4 },
        { useCase: "translation", confidence: 5 },
        { useCase: "email_drafting", confidence: 4 },
        { useCase: "coding_general", confidence: 4 },
      ],
      hasApi: false,
      isOpenSource: false,
      hasFreeTier: true,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "Unlimited free messages",
        proMonthlyUsd: 14.99,
      },
      websiteUrl: "https://chat.mistral.ai",
      logoUrl: "https://avatars.githubusercontent.com/u/132372032",
      ratingOverall: 4.3,
      ratingAccuracy: 4.2,
      ratingSpeed: 4.7,
      ratingCostValue: 4.8,
      ratingEaseOfUse: 4.6,
      reviewsCount: 2104,
      isFeatured: false,
      verificationStatus: "unverified",
    },

    // ── search_product (1) ────────────────────────────────────────────────
    {
      slug: "perplexity-ai",
      name: "Perplexity AI",
      shortDescription:
        "The answer engine — AI reasoning with real-time web citations.",
      fullDescription:
        "Perplexity AI combines frontier LLMs with real-time web access, delivering sourced, verifiable answers rather than hallucinated text. Every response includes clickable citations, making it the gold standard for research, fact-checking, and keeping up with recent events.",
      toolType: "search_product",
      providerId: providerMap["perplexity-ai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "image", isInput: true, isOutput: false },
      ],
      useCaseCoverage: [
        { useCase: "web_search", confidence: 5 },
        { useCase: "fact_checking", confidence: 5 },
        { useCase: "academic_research", confidence: 5 },
        { useCase: "citation_extraction", confidence: 5 },
        { useCase: "deep_research", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      supportsMultimodal: true,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "5 Pro searches/day free",
        proMonthlyUsd: 20,
      },
      websiteUrl: "https://perplexity.ai",
      logoUrl: "https://www.perplexity.ai/favicon.ico",
      benchmarks: [
        { benchmarkName: "Citation Accuracy", score: 96.4, scoreUnit: "%" },
      ],
      ratingOverall: 4.7,
      ratingAccuracy: 4.8,
      ratingSpeed: 4.9,
      ratingCostValue: 4.6,
      ratingEaseOfUse: 4.9,
      reviewsCount: 9102,
      isFeatured: true,
      verificationStatus: "verified",
    },

    // ── coding_tool (2) ───────────────────────────────────────────────────
    {
      slug: "cursor",
      name: "Cursor",
      shortDescription:
        "The AI-first IDE — understand your codebase, write code at the speed of thought.",
      fullDescription:
        "Cursor is a VS Code fork rebuilt from the ground up for AI-pair programming. It understands your entire codebase via embeddings, predicts next edits with multi-line autocomplete, and can rewrite entire functions or debug across files using natural language. Supports all major languages and frameworks.",
      toolType: "coding_tool",
      providerId: providerMap["anysphere"],
      modalities: [
        { modality: "code", isInput: true, isOutput: true },
        { modality: "text", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 5 },
        { useCase: "debugging", confidence: 5 },
        { useCase: "code_review", confidence: 4 },
        { useCase: "app_building", confidence: 5 },
        { useCase: "devops_and_infra", confidence: 3 },
      ],
      hasApi: false,
      isOpenSource: false,
      hasFreeTier: true,
      supportsFunctionCalling: false,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "2000 completions/month",
        proMonthlyUsd: 20,
        businessMonthlyUsd: 40,
        pricingNotes: "Free · Pro $20/mo · Business $40/user/mo",
      },
      websiteUrl: "https://cursor.sh",
      logoUrl: "https://cursor.sh/apple-touch-icon.png",
      benchmarks: [
        { benchmarkName: "SWE-bench Verified", score: 72.8, scoreUnit: "%" },
        { benchmarkName: "Dev Satisfaction", score: 94, scoreUnit: "%" },
      ],
      ratingOverall: 4.8,
      ratingAccuracy: 4.8,
      ratingSpeed: 4.9,
      ratingCostValue: 4.6,
      ratingEaseOfUse: 4.7,
      reviewsCount: 6732,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "github-copilot",
      name: "GitHub Copilot",
      shortDescription:
        "AI pair programmer by GitHub — inline suggestions, chat, and test generation.",
      fullDescription:
        "GitHub Copilot integrates directly into VS Code, JetBrains, Neovim, and more. It generates code completions inline, answers questions about your codebase via Copilot Chat, and can now generate entire pull requests with Copilot Workspace. Backed by OpenAI Codex and GPT-4o.",
      toolType: "coding_tool",
      providerId: providerMap["openai"],
      modalities: [
        { modality: "code", isInput: true, isOutput: true },
        { modality: "text", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 5 },
        { useCase: "code_review", confidence: 4 },
        { useCase: "debugging", confidence: 4 },
        { useCase: "sql_and_data", confidence: 3 },
      ],
      hasApi: false,
      isOpenSource: false,
      hasFreeTier: false,
      pricingType: "subscription",
      pricing: {
        proMonthlyUsd: 10,
        businessMonthlyUsd: 19,
        pricingNotes: "Individual $10/mo · Business $19/user/mo",
      },
      websiteUrl: "https://github.com/features/copilot",
      logoUrl:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      benchmarks: [{ benchmarkName: "HumanEval", score: 73.0, scoreUnit: "%" }],
      ratingOverall: 4.5,
      ratingAccuracy: 4.5,
      ratingSpeed: 4.7,
      ratingCostValue: 4.3,
      ratingEaseOfUse: 4.8,
      reviewsCount: 14221,
      isFeatured: false,
      verificationStatus: "verified",
    },

    // ── image_model (2) ───────────────────────────────────────────────────
    {
      slug: "midjourney-v6",
      name: "Midjourney V6",
      shortDescription:
        "The undisputed king of aesthetic image generation — pixel-perfect photorealism.",
      fullDescription:
        "Midjourney V6 is the most aesthetically refined image generation model available. V6 adds text rendering inside images, dramatically improved prompt adherence, and new inpainting tools. Trusted by studios, designers, and 18M+ creators worldwide. Operates primarily via Discord with a growing web interface.",
      toolType: "image_model",
      providerId: providerMap["midjourney"],
      modalities: [
        { modality: "text", isInput: true, isOutput: false },
        { modality: "image", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "image_generation", confidence: 5 },
        { useCase: "image_editing", confidence: 4 },
        { useCase: "logo_and_design", confidence: 5 },
      ],
      hasApi: false,
      isOpenSource: false,
      hasFreeTier: false,
      pricingType: "subscription",
      pricing: {
        proMonthlyUsd: 10,
        pricingNotes: "Basic $10 · Standard $30 · Pro $60 · Mega $120/mo",
      },
      websiteUrl: "https://midjourney.com",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
      benchmarks: [
        {
          benchmarkName: "Human Preference ELO",
          score: 1380,
          notes: "Top rank",
        },
        { benchmarkName: "Prompt Adherence", score: 94.2, scoreUnit: "%" },
      ],
      ratingOverall: 4.9,
      ratingAccuracy: 4.9,
      ratingSpeed: 4.3,
      ratingCostValue: 4.5,
      ratingEaseOfUse: 3.9,
      reviewsCount: 12840,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "stable-diffusion-3",
      name: "Stable Diffusion 3",
      shortDescription:
        "Open-source image generation with unlimited creative freedom — deploy anywhere.",
      fullDescription:
        "Stable Diffusion 3 introduces a diffusion transformer architecture with significantly improved multi-subject composition, text rendering, and photorealism. As open-source weights, it can be fine-tuned, embedded in products, and run locally — zero usage fees, full ownership.",
      toolType: "image_model",
      providerId: providerMap["stability-ai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: false },
        { modality: "image", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "image_generation", confidence: 5 },
        { useCase: "image_editing", confidence: 4 },
        { useCase: "logo_and_design", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: true,
      hasFreeTier: true,
      isSelfHostable: true,
      supportsFineTuning: true,
      pricingType: "open_source_free",
      pricing: { pricingNotes: "Free weights · Stability API ~$0.065/image" },
      websiteUrl: "https://stability.ai",
      logoUrl: "https://avatars.githubusercontent.com/u/100950301",
      benchmarks: [
        { benchmarkName: "FID Score", score: 18.4, notes: "Lower is better" },
      ],
      ratingOverall: 4.4,
      ratingAccuracy: 4.3,
      ratingSpeed: 4.8,
      ratingCostValue: 5.0,
      ratingEaseOfUse: 3.5,
      reviewsCount: 11200,
      isFeatured: false,
      verificationStatus: "unverified",
    },

    // ── video_model (1) ───────────────────────────────────────────────────
    {
      slug: "runway-gen3-alpha",
      name: "Runway Gen-3 Alpha",
      shortDescription:
        "Cinematic text-to-video — high-fidelity clips with remarkable temporal consistency.",
      fullDescription:
        "Runway Gen-3 Alpha represents a generational leap in AI video synthesis. It produces 10-second clips at up to 1280×768 with consistent character faces, realistic physics, and smooth motion. Used by professional studios including Dove, Nike, and Universal Music for commercial productions.",
      toolType: "video_model",
      providerId: providerMap["runway"],
      modalities: [
        { modality: "text", isInput: true, isOutput: false },
        { modality: "image", isInput: true, isOutput: false },
        { modality: "video", isInput: false, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "video_generation", confidence: 5 },
        { useCase: "video_editing", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "125 credits free",
        proMonthlyUsd: 35,
        pricingNotes: "Standard $15 · Pro $35 · Unlimited $95/mo",
      },
      websiteUrl: "https://runwayml.com",
      logoUrl: "https://runwayml.com/favicon.ico",
      benchmarks: [
        { benchmarkName: "Temporal Consistency", score: 91, scoreUnit: "%" },
      ],
      ratingOverall: 4.5,
      ratingAccuracy: 4.5,
      ratingSpeed: 3.8,
      ratingCostValue: 3.9,
      ratingEaseOfUse: 4.5,
      reviewsCount: 3400,
      isFeatured: true,
      verificationStatus: "verified",
    },

    // ── audio_model (2) ───────────────────────────────────────────────────
    {
      slug: "elevenlabs",
      name: "ElevenLabs",
      shortDescription:
        "The most natural AI voices — instant voice cloning in 30+ languages.",
      fullDescription:
        "ElevenLabs delivers the highest-quality text-to-speech available, with instant voice cloning, emotional expressiveness, and ultra-low latency streaming. Powers audiobooks, video narration, real-time AI agents, and dubbing workflows. Supports 30+ languages with accent control.",
      toolType: "audio_model",
      providerId: providerMap["elevenlabs"],
      modalities: [
        { modality: "text", isInput: true, isOutput: false },
        { modality: "audio", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "text_to_speech", confidence: 5 },
        { useCase: "voice_cloning", confidence: 5 },
        { useCase: "translation", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "10,000 characters/month",
        proMonthlyUsd: 99,
        pricingNotes: "Free · Starter $5 · Creator $22 · Pro $99/mo",
      },
      websiteUrl: "https://elevenlabs.io",
      logoUrl: "https://elevenlabs.io/favicon.ico",
      benchmarks: [
        { benchmarkName: "MOS Naturalness", score: 4.7, scoreUnit: "/5" },
        { benchmarkName: "Emotion Accuracy", score: 89, scoreUnit: "%" },
      ],
      ratingOverall: 4.8,
      ratingAccuracy: 4.9,
      ratingSpeed: 4.7,
      ratingCostValue: 4.3,
      ratingEaseOfUse: 4.8,
      reviewsCount: 8940,
      isFeatured: true,
      verificationStatus: "verified",
    },
    {
      slug: "suno-v4",
      name: "Suno v4",
      shortDescription:
        "Turn any thought into a full song — production-quality music in seconds.",
      fullDescription:
        "Suno v4 generates complete, production-quality songs from simple text prompts — full lyrics, vocals, instrumentation, and mixing in any genre. V4 dramatically improves vocal coherence, lyric adherence, and structural quality, making it genuinely usable for professional music production and content creation.",
      toolType: "audio_model",
      providerId: providerMap["suno-ai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: false },
        { modality: "audio", isInput: false, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "music_generation", confidence: 5 },
        { useCase: "creative_writing", confidence: 3 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      pricingType: "freemium",
      pricing: {
        freeMonthlyLimit: "10 songs/day free",
        proMonthlyUsd: 10,
        pricingNotes: "Free · Pro $10 · Premier $30/mo",
      },
      websiteUrl: "https://suno.ai",
      logoUrl: "https://suno.com/favicon.ico",
      benchmarks: [
        { benchmarkName: "Music Quality MOS", score: 4.2, scoreUnit: "/5" },
        { benchmarkName: "Lyric Adherence", score: 87, scoreUnit: "%" },
      ],
      ratingOverall: 4.6,
      ratingAccuracy: 4.5,
      ratingSpeed: 4.8,
      ratingCostValue: 4.7,
      ratingEaseOfUse: 4.9,
      reviewsCount: 5120,
      isFeatured: false,
      verificationStatus: "verified",
    },

    // ── embedding_model (1) ───────────────────────────────────────────────
    {
      slug: "cohere-embed-v3",
      name: "Cohere Embed v3",
      shortDescription:
        "State-of-the-art multilingual embeddings for semantic search and RAG pipelines.",
      fullDescription:
        "Cohere Embed v3 produces high-dimensional vector embeddings optimized for semantic search, clustering, and retrieval-augmented generation. Supports 100+ languages, outperforms OpenAI Ada-002 on MTEB benchmarks, and is designed for enterprise-scale RAG applications with compression options to reduce storage costs.",
      toolType: "embedding_model",
      providerId: providerMap["cohere"],
      modalities: [
        { modality: "text", isInput: true, isOutput: false },
        { modality: "embeddings", isInput: false, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "deep_research", confidence: 4 },
        { useCase: "document_processing", confidence: 5 },
        { useCase: "data_analysis", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      pricingType: "pay_per_token",
      pricing: { inputPricePerMillion: 0.1, pricingNotes: "$0.10/M tokens" },
      websiteUrl: "https://cohere.com/embeddings",
      apiDocsUrl: "https://docs.cohere.com",
      logoUrl: "https://cohere.com/favicon.ico",
      benchmarks: [
        { benchmarkName: "MTEB Average", score: 64.5, scoreUnit: "%" },
      ],
      ratingOverall: 4.4,
      ratingAccuracy: 4.6,
      ratingSpeed: 4.8,
      ratingCostValue: 4.5,
      ratingEaseOfUse: 4.3,
      reviewsCount: 1840,
      isFeatured: false,
      verificationStatus: "verified",
    },

    // ── agent_framework (2) ───────────────────────────────────────────────
    {
      slug: "autogpt",
      name: "AutoGPT",
      shortDescription:
        "The pioneering open-source autonomous AI agent — set a goal, watch it execute.",
      fullDescription:
        "AutoGPT is the original autonomous AI agent framework. Give it a high-level goal and it independently decomposes tasks, browses the web, writes and runs code, reads and writes files, and iterates until the goal is achieved. The backbone of the modern AI agent ecosystem with 160K+ GitHub stars.",
      toolType: "agent_framework",
      providerId: providerMap["significant-gravitas"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "agentic_workflows", confidence: 5 },
        { useCase: "app_building", confidence: 3 },
        { useCase: "data_analysis", confidence: 3 },
        { useCase: "web_search", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: true,
      hasFreeTier: true,
      isSelfHostable: true,
      pricingType: "open_source_free",
      pricing: { pricingNotes: "Open source — free to self-host" },
      websiteUrl: "https://agpt.co",
      logoUrl: "https://auto-gpt.ai/favicon.ico",
      githubUrl: "https://github.com/Significant-Gravitas/AutoGPT",
      benchmarks: [
        { benchmarkName: "Task Completion Rate", score: 72, scoreUnit: "%" },
      ],
      ratingOverall: 4.1,
      ratingAccuracy: 3.9,
      ratingSpeed: 3.5,
      ratingCostValue: 4.9,
      ratingEaseOfUse: 3.2,
      reviewsCount: 15200,
      isFeatured: false,
      verificationStatus: "unverified",
    },
    {
      slug: "mistral-7b",
      name: "Mistral 7B Instruct",
      shortDescription:
        "Punches far above its weight — a 7B model that beats Llama 2 13B on most tasks.",
      fullDescription:
        "Mistral 7B Instruct is the most downloaded open-source model in its class. Using sliding window attention and grouped-query attention, it achieves near-13B quality at 7B parameter size, making it ideal for local deployment on consumer hardware. Fully instruction-tuned and available on HuggingFace.",
      toolType: "open_source_model",
      providerId: providerMap["mistral-ai"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 4 },
        { useCase: "summarization", confidence: 4 },
        { useCase: "translation", confidence: 3 },
        { useCase: "customer_support_bot", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: true,
      hasFreeTier: true,
      isSelfHostable: true,
      supportsFineTuning: true,
      supportsStreaming: true,
      contextWindowTokens: 32000,
      maxOutputTokens: 4096,
      modelFamily: "Mistral",
      pricingType: "open_source_free",
      pricing: {
        pricingNotes: "Free on HuggingFace · Mistral API $0.25/M tokens",
      },
      websiteUrl: "https://mistral.ai",
      huggingFaceUrl:
        "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
      logoUrl: "https://avatars.githubusercontent.com/u/132372032",
      benchmarks: [
        { benchmarkName: "MMLU", score: 64.1, scoreUnit: "%" },
        { benchmarkName: "HumanEval", score: 35.1, scoreUnit: "%" },
      ],
      ratingOverall: 4.3,
      ratingAccuracy: 4.1,
      ratingSpeed: 4.9,
      ratingCostValue: 5.0,
      ratingEaseOfUse: 4.0,
      reviewsCount: 8210,
      isFeatured: false,
      verificationStatus: "unverified",
    },

    // ── multimodal_tool (1) ───────────────────────────────────────────────
    {
      slug: "gemini-flash-1-5",
      name: "Gemini 1.5 Flash",
      shortDescription:
        "Google's fastest multimodal model — speed and efficiency at production scale.",
      fullDescription:
        "Gemini 1.5 Flash is optimized for high-throughput, latency-sensitive tasks where cost matters. It retains multimodal capability (text, image, audio, video) with a 1M token context window but at 10× lower cost than Pro. Ideal for classification, summarization, extraction, and real-time applications.",
      toolType: "multimodal_tool",
      providerId: providerMap["google-deepmind"],
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "image", isInput: true, isOutput: false },
        { modality: "audio", isInput: true, isOutput: false },
        { modality: "video", isInput: true, isOutput: false },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "summarization", confidence: 5 },
        { useCase: "document_processing", confidence: 5 },
        { useCase: "image_analysis", confidence: 4 },
        { useCase: "data_analysis", confidence: 4 },
        { useCase: "customer_support_bot", confidence: 4 },
      ],
      hasApi: true,
      isOpenSource: false,
      hasFreeTier: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsMultimodal: true,
      contextWindowTokens: 1000000,
      maxOutputTokens: 8192,
      modelFamily: "Gemini 1.5",
      pricingType: "pay_per_token",
      pricing: {
        inputPricePerMillion: 0.075,
        outputPricePerMillion: 0.3,
        pricingNotes: "$0.075/M input · $0.30/M output",
      },
      websiteUrl: "https://ai.google.dev",
      apiDocsUrl: "https://ai.google.dev/docs",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
      benchmarks: [{ benchmarkName: "MMLU", score: 78.9, scoreUnit: "%" }],
      ratingOverall: 4.4,
      ratingAccuracy: 4.4,
      ratingSpeed: 4.9,
      ratingCostValue: 5.0,
      ratingEaseOfUse: 4.5,
      reviewsCount: 3100,
      isFeatured: false,
      verificationStatus: "verified",
    },

    // ── open_source_model (1) ─────────────────────────────────────────────
    {
      slug: "deepseek-r1",
      name: "DeepSeek R1",
      shortDescription:
        "China's open-source reasoning model — o1-level math and coding at near-zero cost.",
      fullDescription:
        "DeepSeek R1 is an open-source reasoning model that matches OpenAI o1 on AIME 2024, MATH-500, and LiveCodeBench while being freely downloadable. Uses chain-of-thought reinforcement learning without supervised fine-tuning. Available in 1.5B to 70B parameter sizes for local or cloud deployment.",
      toolType: "open_source_model",
      providerId: undefined,
      modalities: [
        { modality: "text", isInput: true, isOutput: true },
        { modality: "code", isInput: true, isOutput: true },
      ],
      useCaseCoverage: [
        { useCase: "coding_general", confidence: 5 },
        { useCase: "debugging", confidence: 5 },
        { useCase: "academic_research", confidence: 4 },
        { useCase: "financial_analysis", confidence: 4 },
        { useCase: "data_analysis", confidence: 5 },
      ],
      hasApi: true,
      isOpenSource: true,
      hasFreeTier: true,
      isSelfHostable: true,
      supportsFineTuning: true,
      supportsStreaming: true,
      contextWindowTokens: 128000,
      maxOutputTokens: 8192,
      modelFamily: "DeepSeek R",
      pricingType: "open_source_free",
      pricing: {
        pricingNotes: "Free weights · API $0.55/M input · $2.19/M output",
      },
      websiteUrl: "https://deepseek.com",
      huggingFaceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
      logoUrl: "https://avatars.githubusercontent.com/u/148506986",
      benchmarks: [
        { benchmarkName: "AIME 2024", score: 79.8, scoreUnit: "%" },
        { benchmarkName: "MATH-500", score: 97.3, scoreUnit: "%" },
        { benchmarkName: "LiveCodeBench", score: 65.9, scoreUnit: "%" },
      ],
      ratingOverall: 4.7,
      ratingAccuracy: 4.8,
      ratingSpeed: 4.2,
      ratingCostValue: 5.0,
      ratingEaseOfUse: 3.7,
      reviewsCount: 6450,
      isFeatured: true,
      verificationStatus: "unverified",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SEED USERS (for reviews)
// ─────────────────────────────────────────────────────────────────────────────

const SEED_USERS = [
  {
    email: "priya.sharma@seed.com",
    username: "priya_sharma",
    displayName: "Priya Sharma",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
  {
    email: "marcus.chen@seed.com",
    username: "marcus_chen",
    displayName: "Marcus Chen",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
  {
    email: "alex.rodriguez@seed.com",
    username: "alex_rod",
    displayName: "Alex Rodriguez",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
  {
    email: "zara.ahmed@seed.com",
    username: "zara_ahmed",
    displayName: "Zara Ahmed",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
  {
    email: "kai.nakamura@seed.com",
    username: "kai_nakamura",
    displayName: "Kai Nakamura",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
  {
    email: "sofia.martinez@seed.com",
    username: "sofia_mx",
    displayName: "Sofia Martinez",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
  {
    email: "dev.kapoor@seed.com",
    username: "dev_kapoor",
    displayName: "Dev Kapoor",
    role: "user" as const,
    reviewCount: 0,
    helpfulVoteCount: 0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEED REVIEWS (2 per tool for key tools)
// ─────────────────────────────────────────────────────────────────────────────

function buildReviews(
  toolMap: Record<string, mongoose.Types.ObjectId>,
  userMap: Record<string, mongoose.Types.ObjectId>
) {
  return [
    // Claude 3.5 Sonnet
    {
      toolId: toolMap["claude-3-5-sonnet"],
      userId: userMap["priya_sharma"],
      useCase: "academic_research",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 5,
      ratingCostValue: 4,
      ratingEaseOfUse: 5,
      reviewText:
        "Claude 3.5 Sonnet is the best model I've used for complex academic research. The 200K context window is a genuine game-changer — I can feed it entire research papers and get deeply analytical, coherent responses. The instruction following is remarkably precise.",
      pros: "200K context is transformative; Near-zero hallucination; Excellent instruction following",
      cons: "Expensive at high volume; Slightly slower than GPT-4o",
      wouldRecommend: true,
      upvotes: 412,
    },
    {
      toolId: toolMap["claude-3-5-sonnet"],
      userId: userMap["dev_kapoor"],
      useCase: "coding_general",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 4,
      ratingCostValue: 4,
      ratingEaseOfUse: 5,
      reviewText:
        "For complex TypeScript and refactoring tasks, Claude 3.5 Sonnet is unmatched. It understands the full context of a large codebase, suggests idiomatic fixes, and rarely introduces regressions. The API is well-documented and the rate limits are reasonable for production use.",
      pros: "Deep code understanding; Rarely hallucinates syntax; Great at refactoring",
      cons: "Output tokens are expensive at scale",
      wouldRecommend: true,
      upvotes: 287,
    },
    // GPT-4o
    {
      toolId: toolMap["gpt-4o"],
      userId: userMap["alex_rod"],
      useCase: "coding_general",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 5,
      ratingCostValue: 4,
      ratingEaseOfUse: 5,
      reviewText:
        "GPT-4o's speed-to-intelligence ratio is unbeatable for production workloads. Vision capabilities are class-leading and function calling is rock solid. I've been building with the API for 6 months and uptime has been excellent.",
      pros: "Blazing fast; Best vision model; Huge ecosystem; Excellent function calling",
      cons: "Context window smaller than Claude/Gemini; Can be verbose",
      wouldRecommend: true,
      upvotes: 892,
    },
    {
      toolId: toolMap["gpt-4o"],
      userId: userMap["sofia_mx"],
      useCase: "translation",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 5,
      ratingCostValue: 5,
      ratingEaseOfUse: 5,
      reviewText:
        "For multilingual translation workflows, GPT-4o is the clear winner. It handles Spanish-English-French at near-human quality and maintains tone consistently. The freemium pricing makes it accessible for small projects.",
      pros: "Excellent multilingual; Consistent tone; Good free tier",
      cons: "Occasionally over-formalizes casual text",
      wouldRecommend: true,
      upvotes: 331,
    },
    // Midjourney
    {
      toolId: toolMap["midjourney-v6"],
      userId: userMap["zara_ahmed"],
      useCase: "image_generation",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 4,
      ratingCostValue: 4,
      ratingEaseOfUse: 4,
      reviewText:
        "I've tried every image model and nothing touches Midjourney for sheer aesthetic quality. V6 added text rendering which was the last missing piece. The community and prompt engineering resources are also unmatched.",
      pros: "Unmatched aesthetic quality; Text rendering; Active Discord community",
      cons: "Discord-only workflow is clunky; No API for automation",
      wouldRecommend: true,
      upvotes: 1204,
    },
    {
      toolId: toolMap["midjourney-v6"],
      userId: userMap["marcus_chen"],
      useCase: "logo_and_design",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 4,
      ratingCostValue: 5,
      ratingEaseOfUse: 3,
      reviewText:
        "As a graphic designer, Midjourney V6 has transformed my workflow. Concept exploration that used to take days now takes hours. The quality of outputs, especially for editorial and luxury brand aesthetics, is genuinely commercial-grade.",
      pros: "Commercial-grade quality; Best aesthetic sense of any model",
      cons: "Learning the prompt syntax takes time; No inpainting on web version yet",
      wouldRecommend: true,
      upvotes: 743,
    },
    // Cursor
    {
      toolId: toolMap["cursor"],
      userId: userMap["kai_nakamura"],
      useCase: "app_building",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 5,
      ratingCostValue: 5,
      ratingEaseOfUse: 5,
      reviewText:
        "Cursor has completely replaced VS Code + Copilot for me. The codebase-aware chat means I can ask questions like 'where do we handle auth middleware?' and get precise answers. Tab completion is magical — it reads my intent before I finish typing.",
      pros: "Codebase-aware context; Tab completion is exceptional; Fast",
      cons: "Occasional context window limits on very large codebases",
      wouldRecommend: true,
      upvotes: 1102,
    },
    // ElevenLabs
    {
      toolId: toolMap["elevenlabs"],
      userId: userMap["sofia_mx"],
      useCase: "text_to_speech",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 4,
      ratingCostValue: 4,
      ratingEaseOfUse: 5,
      reviewText:
        "ElevenLabs is leaps ahead of any TTS I've used before. The emotional range is incredible — I've used it for everything from corporate narration to children's audiobooks and it nails the tone every time. Voice cloning is genuinely impressive.",
      pros: "Most natural voices available; Excellent emotional range; Great API",
      cons: "Premium plans are expensive for high-volume use",
      wouldRecommend: true,
      upvotes: 621,
    },
    // DeepSeek R1
    {
      toolId: toolMap["deepseek-r1"],
      userId: userMap["dev_kapoor"],
      useCase: "debugging",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 4,
      ratingCostValue: 5,
      ratingEaseOfUse: 4,
      reviewText:
        "DeepSeek R1 is a genuine landmark moment for open-source AI. On hard coding problems it matches or beats o1, and you can run the distilled 7B version locally on an M2 MacBook. The reasoning traces are incredibly useful for debugging complex logic.",
      pros: "o1-level reasoning; Free and open weights; Reasoning traces are educational",
      cons: "Slower inference; Setup requires some technical knowledge",
      wouldRecommend: true,
      upvotes: 934,
    },
    // Perplexity
    {
      toolId: toolMap["perplexity-ai"],
      userId: userMap["priya_sharma"],
      useCase: "academic_research",
      ratingOverall: 5,
      ratingAccuracy: 5,
      ratingSpeed: 5,
      ratingCostValue: 5,
      ratingEaseOfUse: 5,
      reviewText:
        "Perplexity has become my primary research tool. The combination of real-time web access with LLM synthesis and proper citations is exactly what academic work needs. I can trace every claim back to its source — no hallucination anxiety.",
      pros: "Always up-to-date; Every claim is cited; Fast and clean UI",
      cons: "Deep research mode can be slow on complex queries",
      wouldRecommend: true,
      upvotes: 556,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  const args = process.argv.slice(2);
  const isFresh = args.includes("--fresh");

  console.log("🌱  RateAI Seeder starting...");
  console.log(
    `    Mode: ${isFresh ? "FRESH (drop & reseed)" : "UPSERT (safe)"}`
  );

  await connectDB();
  console.log("✅  Database connected");

  if (isFresh) {
    console.log("🗑️   Dropping existing data...");
    await Promise.all([
      Provider.deleteMany({}),
      Tool.deleteMany({}),
      User.deleteMany({ email: { $regex: "@seed.com$" } }),
      Review.deleteMany({}),
    ]);
    console.log("✅  Existing seed data cleared");
  }

  // ── Upsert Providers ─────────────────────────────────────────────────
  console.log("\n📦  Seeding providers...");
  const providerMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const p of PROVIDERS) {
    const doc = await Provider.findOneAndUpdate(
      { slug: p.slug },
      { $set: p },
      { upsert: true, new: true, runValidators: true }
    );
    providerMap[p.slug] = doc._id as mongoose.Types.ObjectId;
    console.log(`    ✓ ${p.name}`);
  }

  // ── Upsert Tools ──────────────────────────────────────────────────────
  console.log("\n🔧  Seeding tools...");
  const tools = buildTools(providerMap);
  const toolMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const t of tools) {
    const doc = await Tool.findOneAndUpdate(
      { slug: t.slug },
      { $set: t },
      { upsert: true, new: true, runValidators: true }
    );
    toolMap[t.slug] = doc._id as mongoose.Types.ObjectId;
    console.log(`    ✓ [${t.toolType.padEnd(18)}] ${t.name}`);
  }

  // ── Upsert Users ──────────────────────────────────────────────────────
  console.log("\n👤  Seeding users...");
  const userMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const u of SEED_USERS) {
    const doc = await User.findOneAndUpdate(
      { email: u.email },
      { $set: u },
      { upsert: true, new: true }
    );
    userMap[u.username] = doc._id as mongoose.Types.ObjectId;
    console.log(`    ✓ ${u.displayName}`);
  }

  // ── Upsert Reviews ────────────────────────────────────────────────────
  console.log("\n⭐  Seeding reviews...");
  const reviews = buildReviews(toolMap, userMap);
  let reviewCount = 0;
  for (const r of reviews) {
    try {
      await Review.findOneAndUpdate(
        { toolId: r.toolId, userId: r.userId, useCase: r.useCase },
        { $set: r },
        { upsert: true, new: true, runValidators: true }
      );
      reviewCount++;
    } catch (err: any) {
      // Duplicate key on unique index — skip
      if (err.code !== 11000) throw err;
    }
  }
  console.log(`    ✓ ${reviewCount} reviews seeded`);

  // ── Summary ───────────────────────────────────────────────────────────
  const [pCount, tCount, uCount, rCount] = await Promise.all([
    Provider.countDocuments(),
    Tool.countDocuments(),
    User.countDocuments(),
    Review.countDocuments(),
  ]);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉  Seed complete!");
  console.log(`    Providers : ${pCount}`);
  console.log(`    Tools     : ${tCount}`);
  console.log(`    Users     : ${uCount}`);
  console.log(`    Reviews   : ${rCount}`);
  console.log("\n🔗  Tool types seeded:");
  const typeCounts = tools.reduce<Record<string, number>>((acc, t) => {
    acc[t.toolType] = (acc[t.toolType] || 0) + 1;
    return acc;
  }, {});
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`    ${type.padEnd(22)} → ${count} tool(s)`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await disconnectDB();
  process.exit(0);
}

seed().catch(async err => {
  console.error("\n❌  Seed failed:", err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
