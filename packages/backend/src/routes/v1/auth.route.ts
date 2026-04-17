import { getMe, googleLogin, logout, refresh } from "@/controllers";
import { authenticate, validate } from "@/middlewares";
import { googleLoginSchema } from "@/validators";
import { Router } from "express";

const router = Router();

// POST /v1/auth/google   — exchange Firebase ID token for our JWT pair
router.post("/google", validate(googleLoginSchema), googleLogin);

// POST /v1/auth/refresh  — rotate refresh token (reads httpOnly cookie)
router.post("/refresh", refresh);

// POST /v1/auth/logout   — clear refresh token (auth required)
router.post("/logout", authenticate, logout);

// GET  /v1/auth/me       — current user profile
router.get("/me", authenticate, getMe);

export default router;