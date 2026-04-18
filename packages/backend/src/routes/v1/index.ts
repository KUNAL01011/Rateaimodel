import { Router } from "express";
import authRoutes from "./auth.route";
import providerRoutes from "./provider.route";
import toolRoutes from "./tool.route";
import reviewRoutes from "./review.route";
import recommendationRoutes from "./recommendation.route";
import ownershipRoutes from "./ownership.route";
import analyticsRoutes from "./analytics.route";
import userRoutes from "./user.route"

const router = Router();

// ── Auth ──────────────────────────────────────────────────────
router.use("/auth", authRoutes);

// ── Users ─────────────────────────────────────────────────────
router.use("/users", userRoutes);

// ── Core platform ─────────────────────────────────────────────
router.use("/providers", providerRoutes);
router.use("/tools", toolRoutes);
router.use("/reviews", reviewRoutes);
router.use("/recommend", recommendationRoutes);

// ── Ownership & listings ──────────────────────────────────────
router.use("/ownership", ownershipRoutes);

// ── Analytics ─────────────────────────────────────────────────
router.use("/analytics", analyticsRoutes);



export default router;
