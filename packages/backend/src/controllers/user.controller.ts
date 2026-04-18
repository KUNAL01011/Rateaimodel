import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { userService } from "@/services";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "20",
    role,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const result = await userService.getAllUsers({
    page: Number(page),
    limit: Number(limit),
    role: role as string | undefined,
    search: search as string | undefined,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  return res.status(200).json(new ApiResponse(200, result, "User fetched"));
});

export const getPlatformStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await userService.getPlatformStats();

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "platform stats fetched"));
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getByIdAdmin(req.params.userId as string);
  return res.status(200).json(new ApiResponse(200, user, "used info fetched"));
});

export const changeUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.changeRole(
      req.params.userId as string,
      req.body.role
    );

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User role updated"));
  }
);

export const deleteUserAdmin = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccountAdmin(req.params.userId as string);
  return res.status(200).json(new ApiResponse(200, null, "User account deleted"));
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getOwnProfile(req.userId!);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "user profile fetched"));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.userId!, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "user profile updated"));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.userId!);
 
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure:   true,
    sameSite: "strict",
    path:     "/",
  });
 
  return res
    .status(200)
    .json(new ApiResponse(200, null, "user profile deleted"));
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getPublicProfile(req.params.username as string);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "get user profile"));
});

export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await userService.getUserReviews(req.params.username as string, {
    page:  Number(page  ?? 1),
    limit: Number(limit ?? 10),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, "User reviews fetched"));
});