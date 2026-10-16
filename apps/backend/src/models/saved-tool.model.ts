import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISavedTool extends Document {
  userId: Types.ObjectId;
  toolId: Types.ObjectId;
  savedAt: Date;
}

const SavedToolSchema = new Schema<ISavedTool>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  toolId: {
    type: Schema.Types.ObjectId,
    ref: "Tool",
    required: true,
    index: true,
  },
  savedAt: { type: Date, default: Date.now },
});

SavedToolSchema.index({ userId: 1, toolId: 1 }, { unique: true });

export const SavedTool = mongoose.model<ISavedTool>(
  "SavedTool",
  SavedToolSchema
);
