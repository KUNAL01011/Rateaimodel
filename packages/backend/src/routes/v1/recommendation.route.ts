import { recommend } from "@/controllers";
import { authenticate } from "@/middlewares";
import { Router } from "express";

const router = Router();

router.post("/recommend", authenticate, recommend);

export default router;
