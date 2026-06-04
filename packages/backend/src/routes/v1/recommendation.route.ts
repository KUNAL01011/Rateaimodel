import { recommend, getUseCases } from "@/controllers";
import { authenticate, validate } from "@/middlewares";
import { recommendSchema } from "@/validators";
import { Router } from "express";

const router = Router();

// POST /api/v1/recommend  — AI-powered tool matching
router.post("/", authenticate, validate(recommendSchema), recommend);

// GET  /api/v1/recommend/use-cases  — taxonomy
router.get("/use-cases", getUseCases);

export default router;
