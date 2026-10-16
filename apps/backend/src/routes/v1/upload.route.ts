import { Router } from "express";
import { uploadImageHandler } from "@/controllers";
import { authenticate, authorize, upload } from "@/middlewares";

const router = Router();

router.post(
  "/image",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  uploadImageHandler
);

export default router;
