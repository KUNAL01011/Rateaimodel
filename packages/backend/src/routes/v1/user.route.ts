import { Router } from "express";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getPublicProfile,
  getUserReviews,
  getSavedTools,
  toggleSavedTool,
  checkSavedTool,
  // Admin
  getAllUsers,
  getUserById,
  changeUserRole,
  deleteUserAdmin,
  getPlatformStats,
  getAllSubmissions,
  getSubmissionById,
  reviewSubmission,
} from "@/controllers";
import {
  updateProfileSchema,
  changeRoleSchema,
  getAllUsersQuerySchema,
} from "@/validators";

const router = Router();

/* ─── Own account (auth required) ─────────────────────────────────── */
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, validate(updateProfileSchema), updateProfile);
router.delete("/me", authenticate, deleteAccount);

/* ─── Saved tools ──────────────────────────────────────────────────── */
router.get("/me/saved", authenticate, getSavedTools);
router.post("/me/saved/:toolId", authenticate, toggleSavedTool);
router.delete("/me/saved/:toolId", authenticate, toggleSavedTool);
router.get("/me/saved/:toolId/check", authenticate, checkSavedTool);

/* ─── Admin: Platform stats ────────────────────────────────────────── */
router.get("/admin/stats", authenticate, authorize("admin"), getPlatformStats);

/* ─── Admin: Tool submissions ──────────────────────────────────────── */
// IMPORTANT: These MUST come before /admin/:userId to avoid route conflicts
router.get(
  "/admin/submissions",
  authenticate,
  authorize("admin"),
  getAllSubmissions
);
router.get(
  "/admin/submissions/:id",
  authenticate,
  authorize("admin"),
  getSubmissionById
);
router.post(
  "/admin/submissions/:id/review",
  authenticate,
  authorize("admin"),
  reviewSubmission
);

/* ─── Admin: User management ───────────────────────────────────────── */
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  validate(getAllUsersQuerySchema, "query"),
  getAllUsers
);
router.get("/admin/:userId", authenticate, authorize("admin"), getUserById);
router.patch(
  "/admin/:userId/role",
  authenticate,
  authorize("admin"),
  validate(changeRoleSchema),
  changeUserRole
);
router.delete(
  "/admin/:userId",
  authenticate,
  authorize("admin"),
  deleteUserAdmin
);

/* ─── Public profiles ──────────────────────────────────────────────── */
router.get("/:username", getPublicProfile);
router.get("/:username/reviews", getUserReviews);

export default router;
