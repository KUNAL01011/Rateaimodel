import mongoose, { Document, Schema } from "mongoose";

export interface IProvider extends Document {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  isOpenSource: boolean;
  hqCountry?: string;
  foundedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    website: { type: String },
    logoUrl: { type: String },
    isOpenSource: { type: Boolean, default: false },
    hqCountry: { type: String },
    foundedYear: { type: Number },
  },
  { timestamps: true }
);

export const Provider = mongoose.model<IProvider>("Provider", ProviderSchema);
