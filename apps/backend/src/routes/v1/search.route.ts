import { search } from "@/controllers/search.controller";
import { Router } from "express";

const router = Router();

// GET /api/v1/search?q=...&page=1&limit=20
router.get("/", search);

export default router;
