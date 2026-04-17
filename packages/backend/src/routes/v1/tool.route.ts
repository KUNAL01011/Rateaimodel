import { Router } from "express";
import {
  getTools,
  getToolBySlug,
  getSimilarTools,
  getFeaturedTools,
  createTool,
  updateTool,
  deleteTool,
  upsertBenchmark,
  getReviews
} from "@/controllers";
import { validate, authenticate, authorize } from "@/middlewares";
import {
  createToolSchema,
  updateToolSchema,
  toolQuerySchema,
  addBenchmarkSchema,
} from "@/validators/tool.validator";

const router = Router();

// ── Public routes ──────────────────────────────────────────
// GET /v1/tools
router.get("/", validate(toolQuerySchema, "query"), getTools);

// GET /v1/tools/featured
router.get("/featured", getFeaturedTools);

// GET /v1/tools/:slug
router.get("/:slug", getToolBySlug);

// GET /v1/tools/:slug/similar
router.get("/:slug/similar", getSimilarTools);

// GET /v1/tools/:slug/reviews  — reviews for a specific tool
router.get("/:slug/reviews", async (req, res, next) => {
  // Resolve slug → toolId, then delegate to review handler
  const { Tool } = await import("@/models");
  const tool = await Tool.findOne({ slug: req.params.slug });
  if (!tool) return next();
  req.query.toolId = String(tool._id);
  return getReviews(req, res, next);
});

// ── Admin routes ───────────────────────────────────────────
// POST /v1/tools
router.post("/", authenticate, authorize("admin"), validate(createToolSchema), createTool);

// PUT /v1/tools/:slug
router.put("/:slug", authenticate, authorize("admin", "owner"), validate(updateToolSchema), updateTool);

// DELETE /v1/tools/:slug
router.delete("/:slug", authenticate, authorize("admin"), deleteTool);

// POST /v1/tools/:slug/benchmarks  — add or update a benchmark score
router.post("/:slug/benchmarks", authenticate, authorize("admin"), validate(addBenchmarkSchema), upsertBenchmark);

export default router;