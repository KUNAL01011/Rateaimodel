import {z} from "zod";

export const googleLoginSchema = z.object({
  idToken: z.string().min(10, "Firebase ID token is required"),
});

export const refreshTokenSchema = z.object({});