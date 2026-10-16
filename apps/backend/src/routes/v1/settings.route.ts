import { Router } from "express";
import { getSettings, updateSettings } from "@/controllers";
import { authenticate, authorize } from "@/middlewares";

const router = Router();

router.get("/", getSettings);
router.put("/", authenticate, authorize("admin"), updateSettings);

export default router;
