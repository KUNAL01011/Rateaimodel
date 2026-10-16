import { Router } from "express";
import authRoutes from "./auth.route";
import toolRoutes from "./tool.route";
import reviewRoutes from "./review.route";
import recommendationRoutes from "./recommendation.route";
import searchRoutes from "./search.route";
import categoriesRoutes from "./categories.route";
import userRoutes from "./user.route";
import settingsRoutes from "./settings.route";
import blogRoutes from "./blog.route";
import uploadRoutes from "./upload.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tools", toolRoutes);
router.use("/recommend", recommendationRoutes);
router.use("/search", searchRoutes);
router.use("/categories", categoriesRoutes);
router.use("/reviews", reviewRoutes);
router.use("/users", userRoutes);
router.use("/settings", settingsRoutes);
router.use("/blog", blogRoutes);
router.use("/uploads", uploadRoutes);

export default router;
