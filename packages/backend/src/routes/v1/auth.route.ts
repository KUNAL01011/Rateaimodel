import { getMe, googleLogin, logout } from "@/controllers";
import { authenticate } from "@/middlewares";
import { Router } from "express";

const router = Router();

// POST /v1/auth/google   — exchange Firebase ID token for our JWT pair
router.post("/google", googleLogin);

// POST /v1/auth/logout   — clear refresh token (auth required)
router.post("/logout", authenticate, logout);

// GET  /v1/auth/me       — current user profile
router.get("/me", authenticate, getMe);

export default router;
