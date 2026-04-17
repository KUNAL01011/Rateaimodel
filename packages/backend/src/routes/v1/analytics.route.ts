import { Router } from "express";
import { getMyToolAnalytics, getToolAnalyticsAdmin } from "@/controllers";
import { authenticate, authorize } from "@/middlewares";

const router = Router();

router.use(authenticate);

// GET /v1/analytics/tools/:toolId          — owner sees their own tool stats
router.get("/tools/:toolId", authorize("owner", "admin"), getMyToolAnalytics);

// GET /v1/analytics/admin/tools/:toolId    — admin sees any tool's stats
router.get("/admin/tools/:toolId", authorize("admin"), getToolAnalyticsAdmin);

export default router;