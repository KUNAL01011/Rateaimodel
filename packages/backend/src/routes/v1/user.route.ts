import { Router } from "express";
import {
  getAllUsers,
  getPlatformStats,
  getUserById,
  changeUserRole,
  deleteUserAdmin,
  getProfile,
  updateProfile,
  deleteAccount,
  getPublicProfile,
  getUserReviews,
} from "@/controllers";
import { validate, authenticate, authorize } from "@/middlewares";
import {
  getAllUsersQuerySchema,
  updateProfileSchema,
  changeRoleSchema,
  userIdParamSchema,
} from "@/validators";

const router = Router();

/* ─────────────────────────────────────────────
   PUBLIC — no login needed
───────────────────────────────────────────── */

// GET /v1/users/profile/:username
// Public profile page — safe fields only (username, displayName, bio, reviewCount…)
router.get("/profile/:username", getPublicProfile);

// GET /v1/users/profile/:username/reviews
// All reviews written by a user, visible to anyone
router.get("/profile/:username/reviews", getUserReviews);

/* ─────────────────────────────────────────────
   OWN PROFILE — must be logged in
───────────────────────────────────────────── */

// GET    /v1/users/me   — full private profile (email, emailVerified, googleId linked…)
router.get("/me", authenticate, getProfile);

// PUT    /v1/users/me   — update username / displayName / avatarUrl / bio
router.put("/me", authenticate, validate(updateProfileSchema), updateProfile);

// DELETE /v1/users/me   — delete own account, clears cookie, cascades reviews
router.delete("/me", authenticate, deleteAccount);

/* ─────────────────────────────────────────────
   ADMIN — admin role required
───────────────────────────────────────────── */

// GET /v1/users
// Paginated list — ?page=1&limit=20&role=owner&search=kunal&sortBy=createdAt&sortOrder=desc
router.get(
  "/",
  authenticate,
  authorize("admin"),
  validate(getAllUsersQuerySchema, "query"),
  getAllUsers
);

// GET /v1/users/stats
// Platform-wide stats: total users, role breakdown
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  getPlatformStats
);

// GET /v1/users/:userId   — look up any user by MongoDB _id
router.get(
  "/:userId",
  authenticate,
  authorize("admin"),
  validate(userIdParamSchema, "params"),
  getUserById
);

// PATCH /v1/users/:userId/role   — promote / demote a user
router.patch(
  "/:userId/role",
  authenticate,
  authorize("admin"),
  validate(changeRoleSchema),
  changeUserRole
);

// DELETE /v1/users/:userId   — admin deletes any account
router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  deleteUserAdmin
);

export default router;