import { Router } from "express";
import { authenticate } from "@/middlewares";
import { saved, savedTool } from "@/controllers/user.controller";

const router = Router();

router.get("/user/saved", authenticate, saved);
router.post("/saved/:toolId", authenticate, savedTool);

export default router;
