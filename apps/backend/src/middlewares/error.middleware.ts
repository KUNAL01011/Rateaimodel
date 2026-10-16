import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { ApiError, ApiResponse, logger } from "@/utils";
import { myEnvironment } from "@/configs";

export const notFoundHandler = (
  request: Request,
  _response: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    404,
    `Route not found : ${request.method} ${request.originalUrl}`
  );
  return next(error);
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof ZodError) {
    // 400 not 403 — validation failure is a bad request, not forbidden
    const message = err.issues.map(i => i.message).join(", ");
    error = new ApiError(400, message);
  } else if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new ApiError(400, "File too large. Images must be under 2MB");
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = new ApiError(400, `Unsupported file type: ${err.field}`);
    } else {
      error = new ApiError(400, `Upload error: ${err.message}`);
    }
  } else if (err instanceof Error) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      error = new ApiError(
        401,
        `Unauthorized | ${
          err.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
        }`
      );
    } else if (err.name === "CastError") {
      // Mongoose invalid ObjectId
      error = new ApiError(400, "Invalid ID format");
    } else if ((err as any).code === 11000) {
      // Mongoose duplicate key
      const field = Object.keys((err as any).keyValue ?? {})[0] ?? "field";
      error = new ApiError(409, `Duplicate value for ${field}`);
    } else {
      error = new ApiError(500, err.message);
    }
  } else {
    error = new ApiError(500, "Unknown error occurred");
  }

  logger.error(`[${error.statusCode}] ${error.message}`);

  const apiResponse = new ApiResponse<null>(
    error.statusCode,
    null,
    error.message
  );

  if (myEnvironment.NODE_ENV === "development" && error.stack) {
    (apiResponse as any).stack = error.stack;
  }

  return res.status(apiResponse.statusCode).json(apiResponse);
};
