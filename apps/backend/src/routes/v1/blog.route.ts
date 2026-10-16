import { Router } from "express";
import {
  getBlogPosts,
  getBlogPost,
  getAdminBlogPosts,
  getAdminBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import { createBlogSchema, updateBlogSchema } from "@/validators";

const router = Router();

// Public feed
router.get("/", getBlogPosts);

// Admin (static paths before "/:slug")
router.get("/admin", authenticate, authorize("admin"), getAdminBlogPosts);
router.get("/admin/:slug", authenticate, authorize("admin"), getAdminBlogPost);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createBlogSchema),
  createBlogPost
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateBlogSchema),
  updateBlogPost
);
router.delete("/:id", authenticate, authorize("admin"), deleteBlogPost);

// Public single post (last — parameterized)
router.get("/:slug", getBlogPost);

export default router;
