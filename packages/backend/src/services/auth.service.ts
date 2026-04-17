import { firebaseAdmin, myEnvironment } from "@/configs";
import { User } from "@/models";
import { ApiError } from "@/utils";
import { authHelper } from "@/utils";
import { Response } from "express";
import * as admin from "firebase-admin";
import { JwtPayload } from "jsonwebtoken";

const generateTokens = (userId: string) => {
  const accessToken = authHelper.signToken(
    { id: userId },
    myEnvironment.ACCESS_SECRET!,
    { expiresIn: "15m" }
  );
  const refreshToken = authHelper.signToken(
    { id: userId },
    myEnvironment.REFRESH_SECRET!,
    { expiresIn: "3d" }
  );
  return { accessToken, refreshToken };
};

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: myEnvironment.NODE_ENV === "production",
  sameSite: (myEnvironment.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge,
});

const setAccessCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, cookieOptions(15 * 60 * 1000)); // 15 min
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, cookieOptions(30 * 24 * 60 * 60 * 1000)); // 7 days
};

const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
) => {
  setAccessCookie(res, tokens.accessToken);
  setRefreshCookie(res, tokens.refreshToken);
};

export const authService = {
  async googleLogin(firebaseIdToken: string) {
    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await firebaseAdmin.auth().verifyIdToken(firebaseIdToken);
    } catch (error) {
      throw new ApiError(401, "Invalid token");
    }

    const { uid, email, name, picture } = decoded;
    if (!email) throw new ApiError(400, "Google account has no email");

    let isNewUser = false;
    let user = await User.findOne({ googleId: uid });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = uid;
        if (!user.avatarUrl && picture) user.avatarUrl = picture;
        if (!user.displayName && name) user.displayName = name;
        user.emailVerified = true;
        await user.save();
      }

      const username = email.split("@")[0];
      user = await User.create({
        email,
        username,
        displayName: name,
        avatarUrl: picture,
        googleId: uid,
        emailVerified: true,
        role: "user",
      });
      isNewUser = true;
    } else {
      if (picture) user.avatarUrl = picture;
      if (name) user.displayName = name;
      await user.save();
    }

    const tokens = generateTokens(String(user._id));

    return { user, tokens, isNewUser };
  },

  async refreshToken(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = authHelper.verifyToken(
        refreshToken,
        myEnvironment.REFRESH_SECRET!
      );
    } catch (error) {
      throw new ApiError(401, "Invalid token");
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokenHash) {
      throw new ApiError(401, "User not found");
    }

    const hashToken = await authHelper.signHash(refreshToken);

    if (hashToken !== user.refreshTokenHash) {
      user.refreshTokenHash = undefined;
      await user.save();
      throw new ApiError(401, "Invalid token");
    }

    return generateTokens(String(user._id));
  },

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, {$unset: {refreshTokenHash: 1}});
  },

  setRefreshCookie,
  setAccessCookie,
  setAuthCookies,
};
