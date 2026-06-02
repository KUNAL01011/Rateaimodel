import { categories, categoryDetail } from "@/controllers/category.controller";
import { Router } from "express";

const router = Router();

router.get("/", categories);
router.get("/:slug", categoryDetail);

export default router;
