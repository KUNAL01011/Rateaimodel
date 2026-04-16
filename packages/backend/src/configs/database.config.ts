import mongoose from "mongoose";
import { myEnvironment } from "./env.config";
import { logger } from "@/utils";

const dbURL: string = myEnvironment.DATABASE_URL || "";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(dbURL);
    logger.info(`Database connected with ${connection.connection.host}`);
  } catch (error) {
    logger.error("Database connection error", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close(false);
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error while disconnecting database", error);
  }
};
