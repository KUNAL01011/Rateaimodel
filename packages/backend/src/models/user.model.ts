import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "user" | "owner" | "admin";

export interface IUser extends Document {
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  emailVerified: boolean;
  password?: string;

  googleId?: string;

  reviewCount: number;
  helpfulVoteCount: number;
  isApiUser: boolean;

  refreshTokenHash?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false }, // never returned by default
    displayName: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },

    // Google OAuth
    googleId: { type: String, unique: true, sparse: true },

    // Trust signals
    reviewCount: { type: Number, default: 0 },
    helpfulVoteCount: { type: Number, default: 0 },
    isApiUser: { type: Boolean, default: false },
    refreshTokenHash: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) throw new Error("Password is required");
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model<IUser>("User", UserSchema);
