import { getMe, googleLogin, logout, login } from "@/controllers";
import { authenticate } from "@/middlewares";
import { authLimiter } from "@/middlewares/rateLimit.middleware";
import { Router } from "express";

const router = Router();

// POST /api/v1/auth/google  — exchange Firebase ID token for access token
router.post("/google", authLimiter, googleLogin);

router.post("/login", login);

// POST /api/v1/auth/logout  — clear cookie
router.post("/logout", authenticate, logout);

// GET  /api/v1/auth/me      — current user
router.get("/me", authenticate, getMe);

export default router;
