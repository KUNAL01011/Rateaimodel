import { Request, Response, NextFunction } from "express";
import { type ZodType, ZodError } from "zod";
import { ApiError } from "@/utils";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: ZodType, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);

      if (target === "query") {
        Object.keys(req.query).forEach(k => delete (req.query as any)[k]);

        Object.assign(req.query, parsed);
      } else {
        req[target] = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map(i => i.message).join(", ");
        next(new ApiError(400, message));
      } else {
        next(error);
      }
    }
  };
