import { createReview, getReviews, voteReview } from "@/controllers";
import { authenticate } from "@/middlewares";
import { Router } from "express";

const router = Router();

router.get("/tools/:toolId?reviews", getReviews);
router.post("/reviews", authenticate, createReview);
router.post("/reviews/:reviewId/helpful", authenticate, voteReview);

export default router;
