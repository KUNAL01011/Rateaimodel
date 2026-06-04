import { Router } from "express";
import {
  getTools,
  getToolBySlug,
  getFeaturedTools,
  getTrendingTools,
  getSimilarTools,
  createTool,
  updateTool,
  deleteTool,
  upsertBenchmark,
  createToolListingRequest,
} from "@/controllers";
import { authenticate, authorize, upload, validate } from "@/middlewares";
import {
  createToolSchema,
  updateToolSchema,
  toolQuerySchema,
  addBenchmarkSchema,
} from "@/validators";

const router = Router();

// ── Static routes FIRST (before /:slug) ──────────────────────────────
router.get("/featured", getFeaturedTools);
router.get("/trending", getTrendingTools);

// ── Submit a new tool listing (auth required) ─────────────────────────
router.post(
  "/submit",
  authenticate,
  upload.single("logo"),
  createToolListingRequest
);

// ── Collection ────────────────────────────────────────────────────────
router.get("/", validate(toolQuerySchema, "query"), getTools);

// ── Admin CRUD ─────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createToolSchema),
  createTool
);

// ── Parameterized routes LAST ──────────────────────────────────────────
router.get("/:slug", getToolBySlug);
router.put(
  "/:slug",
  authenticate,
  authorize("admin"),
  validate(updateToolSchema),
  updateTool
);
router.delete("/:slug", authenticate, authorize("admin"), deleteTool);
router.get("/:slug/similar", getSimilarTools);
router.post(
  "/:slug/benchmarks",
  authenticate,
  authorize("admin"),
  validate(addBenchmarkSchema),
  upsertBenchmark
);

export default router;
