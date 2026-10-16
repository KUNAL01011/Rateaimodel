export type ToolType =
  | "LLM"
  | "Image"
  | "Video"
  | "Audio"
  | "Code"
  | "Agent"
  | "Bot"
  | "Automation"
  | "Analytics"
  | "Multimodal";
export type PricingModel =
  | "Free"
  | "Freemium"
  | "Paid"
  | "Enterprise"
  | "Open Source";
export type Modality = "Text" | "Image" | "Audio" | "Video" | "Code";

export interface Owner {
  id: string;
  name: string;
  logo: string;
  website: string;
  founded: string;
  hq: string;
  description: string;
  employees: string;
  fundingStage: string;
  totalFunding: string;
  verified: boolean;
  linkedIn?: string;
  twitter?: string;
}

export interface Benchmark {
  name: string;
  score: string;
  vsAvg: string;
  positive: boolean;
}

export interface RatingBreakdown {
  accuracy: number;
  speed: number;
  costValue: number;
  easeOfUse: number;
  reliability: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userInitials: string;
  rating: number;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  useCase: string;
  date: string;
  helpful: number;
  ownerResponse?: string;
}

export interface AITool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  coverImage?: string;
  owner: Owner;
  type: ToolType;
  category: string;
  tags: string[];
  pricing: PricingModel;
  pricingDetails: string;
  rating: number;
  reviewCount: number;
  ratingBreakdown: RatingBreakdown;
  modalities: Modality[];
  hasApi: boolean;
  isOpenSource: boolean;
  contextWindow?: string;
  latency?: string;
  launchDate: string;
  lastUpdated: string;
  benchmarks: Benchmark[];
  reviews: Review[];
  featured?: boolean;
  trending?: boolean;
  verified: boolean;
  website: string;
  apiDocs?: string;
  usersCount: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  count: number;
  featured: AITool[];
}

export interface SearchFilters {
  query: string;
  types: ToolType[];
  pricing: PricingModel[];
  modalities: Modality[];
  hasApi: boolean | null;
  isOpenSource: boolean | null;
  minRating: number;
  sortBy: "rating" | "newest" | "popular" | "trending";
}
