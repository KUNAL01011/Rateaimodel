import mongoose, { Document, Schema, Types } from "mongoose";
import { CLAIM_STATUSES, ClaimStatus } from "./enums";

// ─── ToolOwnership (active, approved ownership record) ────────────────────────
export interface IToolOwnership extends Document {
  toolId: Types.ObjectId;
  userId: Types.ObjectId;
  grantedAt: Date;
  grantedById?: Types.ObjectId; // admin who approved; null = auto-approved
}

const ToolOwnershipSchema = new Schema<IToolOwnership>({
  toolId: {
    type: Schema.Types.ObjectId,
    ref: "Tool",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  grantedAt: { type: Date, default: Date.now },
  grantedById: { type: Schema.Types.ObjectId, ref: "User" },
});

ToolOwnershipSchema.index({ toolId: 1, userId: 1 }, { unique: true });

export const ToolOwnership = mongoose.model<IToolOwnership>(
  "ToolOwnership",
  ToolOwnershipSchema
);

// ─── OwnershipClaim (claim request workflow) ──────────────────────────────────
export type VerificationMethod =
  | "dns_txt_record"
  | "email_domain"
  | "meta_tag"
  | "manual_review";

export interface IOwnershipClaim extends Document {
  toolId: Types.ObjectId;
  userId: Types.ObjectId;
  status: ClaimStatus;

  verificationMethod: VerificationMethod;
  verificationToken?: string; // token they add to DNS/HTML
  verificationValue?: string; // domain they claim, e.g. "anthropic.com"

  submittedAt: Date;
  reviewedAt?: Date;
  reviewedById?: Types.ObjectId;
  rejectionReason?: string;
}

const OwnershipClaimSchema = new Schema<IOwnershipClaim>({
  toolId: {
    type: Schema.Types.ObjectId,
    ref: "Tool",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: CLAIM_STATUSES,
    default: "pending",
    index: true,
  },

  verificationMethod: {
    type: String,
    enum: ["dns_txt_record", "email_domain", "meta_tag", "manual_review"],
    required: true,
  },
  verificationToken: String,
  verificationValue: String,

  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedById: { type: Schema.Types.ObjectId, ref: "User" },
  rejectionReason: String,
});

export const OwnershipClaim = mongoose.model<IOwnershipClaim>(
  "OwnershipClaim",
  OwnershipClaimSchema
);
