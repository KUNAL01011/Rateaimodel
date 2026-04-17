import { z } from "zod";

export const submitClaimSchema = z.object({
  toolId: z.string().min(1),
  verificationMethod: z.enum(["dns_txt_record", "email_domain", "meta_tag", "manual_review"]),
  verificationValue: z.string().min(1, "Domain or value is required"),
});

export const reviewClaimSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

// For owner submitting a brand-new tool listing
export const submitNewToolListingSchema = z.object({
  // Basic info
  name: z.string().min(1),
  shortDescription: z.string().min(1).max(160),
  fullDescription: z.string().optional(),
  websiteUrl: z.string().url("A valid website URL is required"),
  logoUrl: z.string().url().optional(),

  // Ownership proof
  verificationMethod: z.enum(["dns_txt_record", "email_domain", "meta_tag", "manual_review"]),
  verificationValue: z.string().min(1, "Domain or email is required"),

  // Tool details (optional at submission — can be filled after claim)
  toolType: z.string().optional(),
  pricingType: z.string().optional(),
  hasFreeTier: z.boolean().optional(),
  hasApi: z.boolean().optional(),
});