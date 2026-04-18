import { Router } from "express";
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  voteReview,
  addOwnerResponse,
  updateOwnerResponse,
  hideReview,
  unhideReview,
} from "@/controllers";
import { validate, authenticate, authorize } from "@/middlewares";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  voteReviewSchema,
  ownerResponseSchema,
} from "@/validators";

const router = Router();

// ── Public ──────────────────────────────────────────────────
// GET /v1/reviews
router.get("/", validate(reviewQuerySchema, "query"), getReviews);

// GET /v1/reviews/:id
router.get("/:id", getReview);

// ── Authenticated ────────────────────────────────────────────
// POST /v1/reviews
router.post("/", authenticate, validate(createReviewSchema), createReview);

// PUT /v1/reviews/:id
router.put("/:id", authenticate, validate(updateReviewSchema), updateReview);

// DELETE /v1/reviews/:id
router.delete("/:id", authenticate, deleteReview);

// POST /v1/reviews/:id/vote
router.post("/:id/vote", authenticate, validate(voteReviewSchema), voteReview);

// POST /v1/reviews/:id/response   — tool owner only
router.post("/:id/response", authenticate, authorize("owner", "admin"), validate(ownerResponseSchema), addOwnerResponse);

// PUT /v1/reviews/:id/response    — update owner response
router.put("/:id/response", authenticate, authorize("owner", "admin"), validate(ownerResponseSchema), updateOwnerResponse);

// ── Admin ────────────────────────────────────────────────────
// POST /v1/reviews/:id/hide
router.post("/:id/hide", authenticate, authorize("admin"), hideReview);

// POST /v1/reviews/:id/unhide
router.post("/:id/unhide", authenticate, authorize("admin"), unhideReview);

export default router;