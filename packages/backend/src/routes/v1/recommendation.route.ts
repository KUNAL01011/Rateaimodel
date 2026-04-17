import { Router } from "express";
import {
  recommend,
  recordRecommendClick,
  getUseCases,
} from "@/controllers/recommendation.controller";
import { validate } from "@/middlewares";
import { recommendSchema } from "@/validators/recommendation.validator";

const router = Router();

// GET  /v1/recommend/use-cases   — taxonomy for dropdowns in frontend
router.get("/use-cases", getUseCases);

// POST /v1/recommend             — main recommendation endpoint
router.post("/", validate(recommendSchema), recommend);

// POST /v1/recommend/click/:toolId — record a click from recommender results
router.post("/click/:toolId", recordRecommendClick);

export default router;