import { NextFunction, Request, Response } from "express";
import {ZodError} from "zod";
import {MulterError} from "multer";
import { ApiError,ApiResponse,logger } from "@/utils";
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
  if(err instanceof ApiError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = new ApiError(403, err.issues[0].message);
  } else if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new ApiError(
        400,
        "File too large. Documents must be under 10MB"
      );
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = new ApiError(400, `Unsupported file type: ${err.field}`)
    } else {
      error = new ApiError(400, `Upload error: ${err.message}`);
    } 
  } else if (err instanceof Error) {
      if(err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
        error = new ApiError(
          401, 
          `Unauthorized | ${err.name === "TokenExpiredError" ? "Token expired" : "Invalid token"}`
        );
      } else {
        error = new ApiError(500, err.message)
      }
    } else {
      error = new ApiError(500, "Unknown error occurred")
    }

    logger.error(`[${error.statusCode}] ${error.message}`);

    const apiResponse = new ApiResponse<null>(
      error.statusCode,
      null,
      error.message
    );

    if (myEnvironment.NODE_ENV === "development" && error.stack) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiResponse as any).stack = error.stack;
    }

    return res.status(apiResponse.statusCode).json(apiResponse);
}