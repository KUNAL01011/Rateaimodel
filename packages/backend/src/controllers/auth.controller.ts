import { myEnvironment } from "@/configs";
import { User } from "@/models";
import { authService } from "@/services";
import { ApiError, ApiResponse, asyncHandler, authHelper } from "@/utils";
import bcrypt from "bcryptjs";
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

  const cookieOpts = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
  };

  res.clearCookie("accessToken", cookieOpts);
  res.clearCookie("refreshToken", cookieOpts); // belt-and-suspenders

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

// No-op kept so controllers/index.ts doesn't break
export const refresh = asyncHandler(async (_req: Request, res: Response) => {
  return res
    .status(410)
    .json(
      new ApiResponse(410, null, "Refresh tokens are not used in this version")
    );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide all fields");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  const accessToken = authHelper.signToken(
    { id: String(user._id) },
    myEnvironment.ACCESS_SECRET!,
    { expiresIn: "15d" }
  );

  authService.setAuthCookies(res, {
    accessToken,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
      "Admin login successful"
    )
  );
});
