export const TOOL_TYPES = [
  "llm_model",
  "chat_product",
  "search_product",
  "coding_tool",
  "image_model",
  "video_model",
  "audio_model",
  "embedding_model",
  "agent_framework",
  "multimodal_tool",
  "open_source_model",
] as const;
export type ToolType = (typeof TOOL_TYPES)[number];

export const PRICING_TYPES = [
  "free",
  "open_source_free",
  "freemium",
  "subscription",
  "pay_per_token",
  "pay_per_use",
  "enterprise",
] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const MODALITIES = [
  "text",
  "image",
  "audio",
  "video",
  "code",
  "embeddings",
  "documents",
  "structured_data",
] as const;
export type Modality = (typeof MODALITIES)[number];

export const USE_CASES = [
  // Development
  "coding_general",
  "code_review",
  "debugging",
  "app_building",
  "sql_and_data",
  "devops_and_infra",
  // Research & Knowledge
  "academic_research",
  "citation_extraction",
  "fact_checking",
  "web_search",
  "deep_research",
  // Writing & Content
  "copywriting",
  "long_form_writing",
  "creative_writing",
  "summarization",
  "translation",
  "email_drafting",
  "seo_content",
  // Image & Visual
  "image_generation",
  "image_editing",
  "image_analysis",
  "logo_and_design",
  // Audio & Video
  "text_to_speech",
  "speech_to_text",
  "voice_cloning",
  "music_generation",
  "video_generation",
  "video_editing",
  // Data & Business
  "data_analysis",
  "spreadsheet_work",
  "document_processing",
  "customer_support_bot",
  "crm_and_sales",
  // Personal Productivity
  "personal_assistant",
  "study_and_learning",
  "brainstorming",
  // Specialized
  "legal_analysis",
  "medical_information",
  "financial_analysis",
  "agentic_workflows",
] as const;
export type UseCase = (typeof USE_CASES)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "claimed",
  "verified",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const CLAIM_STATUSES = ["pending", "approved", "rejected"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const VOTE_TYPES = ["up", "down"] as const;
export type VoteType = (typeof VOTE_TYPES)[number];
