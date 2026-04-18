import { z } from "zod";

/* ── Query for admin: list all users ── */
export const getAllUsersQuerySchema = z.object({
  page:      z.string().optional(),
  limit:     z.string().optional(),
  role:      z.enum(["user", "owner", "admin"]).optional(),
  search:    z.string().optional(),          // matches username, email, displayName
  sortBy:    z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/* ── Update own profile ── */
export const updateProfileSchema = z.object({
  username:    z.string()
                 .min(3, "Username must be at least 3 characters")
                 .max(30, "Username cannot exceed 30 characters")
                 .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores")
                 .optional(),
  displayName: z.string().min(1).max(60).optional(),
  avatarUrl:   z.string().url("Must be a valid URL").optional(),
  bio:         z.string().max(300, "Bio cannot exceed 300 characters").optional(),
});

/* ── Admin: change a user's role ── */
export const changeRoleSchema = z.object({
  role: z.enum(["user", "owner", "admin"]),
});

/* ── Admin: get user by id param ── */
export const userIdParamSchema = z.object({
  userId: z.string().min(1),
});