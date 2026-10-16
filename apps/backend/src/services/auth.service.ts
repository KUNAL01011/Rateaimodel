import { firebaseAdmin, myEnvironment } from "@/configs";
import { User } from "@/models";
import { ApiError, authHelper } from "@/utils";
import { Response } from "express";
import * as admin from "firebase-admin";

// 15-day access token (no refresh flow per project spec)
const ACCESS_EXPIRY = "15d";

const generateTokens = (userId: string) => {
  const accessToken = authHelper.signToken(
    { id: userId },
    myEnvironment.ACCESS_SECRET!,
    { expiresIn: ACCESS_EXPIRY }
  );
  return { accessToken };
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: myEnvironment.NODE_ENV === "production",
  sameSite: (myEnvironment.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
});

export const setAccessCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, cookieOptions());
};

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string }
) => {
  setAccessCookie(res, tokens.accessToken);
};

export const authService = {
  async googleLogin(firebaseIdToken: string) {
    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await firebaseAdmin.auth().verifyIdToken(firebaseIdToken);
    } catch {
      throw new ApiError(401, "Invalid Firebase token");
    }

    const { uid, email, name, picture } = decoded;
    if (!email) throw new ApiError(400, "Google account has no email");

    let isNewUser = false;
    let user = await User.findOne({ googleId: uid });

    if (!user) {
      // Try linking by email
      user = await User.findOne({ email });
      if (user) {
        user.googleId = uid;
        if (!user.avatarUrl && picture) user.avatarUrl = picture;
        if (!user.displayName && name) user.displayName = name;
        await user.save();
      } else {
        // Create new user
        const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
        let username = baseUsername;
        // Ensure unique username
        let counter = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter++}`;
        }
        user = await User.create({
          email,
          username,
          displayName: name,
          avatarUrl: picture,
          googleId: uid,
          role: "user",
        });
        isNewUser = true;
      }
    } else {
      if (picture) user.avatarUrl = picture;
      if (name) user.displayName = name;
      await user.save();
    }

    const tokens = generateTokens(String(user._id));
    return { user, tokens, isNewUser };
  },

  async logout(userId: string) {
    // Nothing to clear server-side (no refresh token stored)
    // Client just clears the cookie
    await User.findById(userId); // confirm user exists
  },

  setAccessCookie,
  setAuthCookies,
};
