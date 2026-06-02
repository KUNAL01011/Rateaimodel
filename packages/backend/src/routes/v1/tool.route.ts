import { Router } from "express";
import { getTools, getToolBySlug, getFeaturedTools } from "@/controllers";
import { authenticate, upload } from "@/middlewares";
import {
  createToolListingRequest,
  getTrendingTools,
} from "@/controllers/tool.controller";

const router = Router();

router.get("/", getTools);
router.get("/:slug", getToolBySlug);
router.get("/featured", getFeaturedTools);
router.get("/trending", getTrendingTools);
router.post(
  "/list-request",
  authenticate,
  upload.single("logo"),
  createToolListingRequest
);

export default router;
