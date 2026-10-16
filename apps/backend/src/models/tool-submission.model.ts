import mongoose, { Document, Schema, Types } from "mongoose";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface IToolSubmission extends Document {
  // Submitter
  submittedById: Types.ObjectId;
  submittedByEmail: string;

  // Tool info as submitted
  name: string;
  website: string;
  tagline: string;
  description: string;
  toolType: string;
  pricing: string;
  pricingDetails?: string;
  modalities?: string[];
  hasApi: boolean;
  isOpenSource: boolean;
  ownerName: string;
  ownerEmail: string;

  // Uploaded logo (Cloudinary URL or local path)
  logoUrl?: string;

  // Moderation
  status: SubmissionStatus;
  reviewedById?: Types.ObjectId;
  reviewedAt?: Date;
  adminNote?: string;

  // Once approved, the created Tool _id
  approvedToolId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ToolSubmissionSchema = new Schema<IToolSubmission>(
  {
    submittedById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    submittedByEmail: { type: String, required: true },

    name: { type: String, required: true },
    website: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    toolType: { type: String, required: true },
    pricing: { type: String, required: true },
    pricingDetails: String,
    modalities: [String],
    hasApi: { type: Boolean, default: false },
    isOpenSource: { type: Boolean, default: false },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    logoUrl: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedById: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    adminNote: String,
    approvedToolId: { type: Schema.Types.ObjectId, ref: "Tool" },
  },
  { timestamps: true }
);

export const ToolSubmission = mongoose.model<IToolSubmission>(
  "ToolSubmission",
  ToolSubmissionSchema
);
