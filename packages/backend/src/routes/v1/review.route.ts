import {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  voteReview,
  addOwnerResponse,
  updateOwnerResponse,
  hideReview,
  unhideReview,
} from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  voteReviewSchema,
  ownerResponseSchema,
} from "@/validators";
import { Router } from "express";

const router = Router();

// Collection
router.get("/", validate(reviewQuerySchema, "query"), getReviews);
router.post("/", authenticate, validate(createReviewSchema), createReview);

// By tool (shortcut)
router.get("/tool/:toolId", validate(reviewQuerySchema, "query"), getReviews);

// Single review
router.get("/:id", getReview);
router.put("/:id", authenticate, validate(updateReviewSchema), updateReview);
router.delete("/:id", authenticate, deleteReview);

// Vote
router.post("/:id/vote", authenticate, validate(voteReviewSchema), voteReview);

// Owner response
router.post(
  "/:id/response",
  authenticate,
  validate(ownerResponseSchema),
  addOwnerResponse
);
router.put(
  "/:id/response",
  authenticate,
  validate(ownerResponseSchema),
  updateOwnerResponse
);

// Admin moderation
router.post("/:id/hide", authenticate, authorize("admin"), hideReview);
router.post("/:id/unhide", authenticate, authorize("admin"), unhideReview);

export default router;
