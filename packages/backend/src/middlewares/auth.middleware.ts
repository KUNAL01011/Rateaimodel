import { myEnvironment } from "@/configs";
import { User } from "@/models";
import { ApiError, authHelper } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken ?? null;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    let decoded: { id: string };
    try {
      decoded = authHelper.verifyToken<{ id: string }>(
        token,
        myEnvironment.ACCESS_SECRET!
      );
    } catch (jwtErr: any) {
      // Give the client a clear signal so it can re-login
      if (jwtErr.name === "TokenExpiredError") {
        // Clear the stale cookie so browser doesn't keep retrying
        res.clearCookie("accessToken", { path: "/" });
        throw new ApiError(401, "Token expired — please sign in again");
      }
      throw new ApiError(401, "Invalid token");
    }

    const user = await User.findById(decoded.id).select("-refreshTokenHash");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req.user as any)?.role ?? "user";
    if (!roles.includes(userRole)) {
      return next(new ApiError(403, "Forbidden: insufficient permissions"));
    }
    next();
  };
};
