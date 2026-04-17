import { authService } from "@/services";
import { ApiResponse, asyncHandler } from "@/utils";
import { Request, Response } from "express";

export const googleLogin = asyncHandler(async (req:Request, res:Response) => {
  const {idToken} = req.body;
  const {user, tokens, isNewUser} = await authService.googleLogin(idToken);

  authService.setAuthCookies(res, tokens);

  return res.status(200).json(
    new ApiResponse(200, {
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
    }, isNewUser ? "Welcome to RateAI!" : "Welcome back to RateAI")
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          null,
          "User not authorized"
        )
      );
  }

  const tokens  = await authService.refreshToken(token);

  authService.setAuthCookies(res, tokens);

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "refreshed successfully")
    );
});
 
/* ── POST /auth/logout ── */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.userId!);
  
  res.clearCookie("refreshToken", { path: "/" });
  res.clearCookie("accessToken", { path: "/" });

  return res.status(200).json(
    new ApiResponse(200, null, "Logout successfully")
  );
});
 
/* ── GET /auth/me ── */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json(
    new ApiResponse(200, req.user, "profile fetched")
  );
});