import { myEnvironment } from "@/configs";
import { User } from "@/models";
import { ApiError, authHelper } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const authenticate = async ( req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken ?? null;

    if (!token) {
      throw new ApiError(401, "User is not authorized");
    }

    const decoded = authHelper.verifyToken<{id: string}>(
      token, 
      myEnvironment.ACCESS_SECRET!
    );

    const user = await User.findById(decoded.id);

    if(!user) {
      throw new ApiError(
        401,
        "User not found"
      )
    }

    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (error) {
    next(error);
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req.user as any)?.role ?? "user";
    if (!roles.includes(userRole)) {
      return next(
        new ApiError(403, "Forbidden")
      );
    }
    next();
  };
};