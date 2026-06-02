import { search } from "@/controllers/search.controller";
import { Router } from "express";

const router = Router();

router.get("/search", search);

export default router;
