import { authService } from "@/services";
import { ApiResponse, asyncHandler } from "@/utils";
import { Request, Response } from "express";

/* ── POST /api/v1/auth/google ── */
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  const { user, tokens, isNewUser } = await authService.googleLogin(idToken);

  authService.setAuthCookies(res, tokens);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: tokens.accessToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
        isNewUser,
      },
      isNewUser ? "Welcome to RateAI!" : "Welcome back to RateAI"
    )
  );
});

/* ── POST /api/v1/auth/logout ── */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.userId!);
  res.clearCookie("accessToken", { path: "/" });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

/* ── GET /api/v1/auth/me ── */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const u = req.user as any;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: u._id,
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        role: u.role,
        reviewCount: u.reviewCount,
        helpfulVoteCount: u.helpfulVoteCount,
        createdAt: u.createdAt,
      },
      "Profile fetched"
    )
  );
});

// Keep refresh export so controllers/index.ts doesn't break — it's a no-op now
export const refresh = asyncHandler(async (_req: Request, res: Response) => {
  return res
    .status(410)
    .json(
      new ApiResponse(410, null, "Refresh tokens are not used in this version")
    );
});
