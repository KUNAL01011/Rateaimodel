import mongoose, { Document, Schema } from "mongoose";

/**
 * Site-wide settings — a single document ("singleton") the admin edits from the
 * dashboard to control the public site's SEO, branding, analytics and social.
 */

interface IPageSeo {
  path: string; // e.g. "/", "/leaderboard", "/categories"
  label?: string; // display name in the dashboard rail
  title?: string;
  description?: string;
  keywords?: string[];
  ogImageUrl?: string;
  canonical?: string;
  noindex?: boolean;
}

const PageSeoSchema = new Schema<IPageSeo>(
  {
    path: { type: String, required: true },
    label: String,
    title: String,
    description: String,
    keywords: { type: [String], default: undefined },
    ogImageUrl: String,
    canonical: String,
    noindex: { type: Boolean, default: false },
  },
  { _id: false }
);

export interface ISiteSettings extends Document {
  // Branding
  siteName: string;
  tagline: string;

  // Global SEO defaults
  defaultTitle: string;
  titleTemplate: string; // "%s · RateAI"
  defaultDescription: string;
  keywords: string[];
  ogImageUrl?: string;
  canonicalBaseUrl?: string;
  twitterHandle?: string;

  // Per-page SEO overrides
  pageSeo: IPageSeo[];

  // Analytics & verification
  googleAnalyticsId?: string;
  googleSiteVerification?: string;

  // Social links
  twitterUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;

  // Feature flags
  blogEnabled: boolean;
  announcement?: string; // optional banner text

  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: "RateAI" },
    tagline: {
      type: String,
      default: "The Review Index for AI Tools",
    },

    defaultTitle: {
      type: String,
      default: "RateAI — The Review Index for AI Tools",
    },
    titleTemplate: { type: String, default: "%s · RateAI" },
    defaultDescription: {
      type: String,
      default:
        "Independent, use-case-specific ratings for AI tools, models, agents and bots — so you choose on evidence, not hype.",
    },
    keywords: {
      type: [String],
      default: ["AI tools", "AI models", "AI reviews", "AI ratings"],
    },
    ogImageUrl: String,
    canonicalBaseUrl: { type: String, default: "https://rateaimodel.com" },
    twitterHandle: String,

    pageSeo: { type: [PageSeoSchema], default: [] },

    googleAnalyticsId: String,
    googleSiteVerification: String,

    twitterUrl: String,
    githubUrl: String,
    linkedinUrl: String,

    blogEnabled: { type: Boolean, default: true },
    announcement: String,
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<ISiteSettings>(
  "SiteSettings",
  SiteSettingsSchema
);
