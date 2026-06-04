import { Review, ToolOwnership, User, SavedTool } from "@/models";
import { ApiError } from "@/utils";

export interface GetAllUsersParams {
  page: number;
  limit: number;
  role?: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const PUBLIC_FIELDS =
  "username displayName avatarUrl bio role reviewCount helpfulVoteCount createdAt";
const PRIVATE_FIELDS =
  "username displayName avatarUrl bio role reviewCount helpfulVoteCount isApiUser email createdAt updatedAt";

export const userService = {
  async getAllUsers({
    page,
    limit,
    role,
    search,
    sortBy,
    sortOrder,
  }: GetAllUsersParams) {
    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select(PRIVATE_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getByIdAdmin(userId: string) {
    const user = await User.findById(userId).select(PRIVATE_FIELDS);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async getPublicProfile(username: string) {
    const user = await User.findOne({ username }).select(PUBLIC_FIELDS);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async getOwnProfile(userId: string) {
    const user = await User.findById(userId).select(PRIVATE_FIELDS);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async updateProfile(
    userId: string,
    data: {
      username?: string;
      displayName?: string;
      avatarUrl?: string;
      bio?: string;
    }
  ) {
    if (data.username) {
      const taken = await User.findOne({
        username: data.username,
        _id: { $ne: userId },
      });
      if (taken) throw new ApiError(409, "This username is already taken");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).select(PRIVATE_FIELDS);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async changeRole(userId: string, role: "user" | "owner" | "admin") {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select(PRIVATE_FIELDS);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async deleteAccount(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new ApiError(404, "User not found");
    await Promise.all([
      Review.deleteMany({ userId }),
      ToolOwnership.deleteMany({ userId }),
      SavedTool.deleteMany({ userId }),
    ]);
    return user;
  },

  async getUserReviews(
    username: string,
    { page = 1, limit = 10 }: { page?: number; limit?: number }
  ) {
    const user = await User.findOne({ username });
    if (!user) throw new ApiError(404, "User not found");
    const filter = { userId: user._id, isHidden: false };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Review.find(filter)
        .populate("toolId", "name slug logoUrl shortDescription")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getPlatformStats() {
    const [totalUsers, totalByRole] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ]);
    const roleBreakdown = totalByRole.reduce(
      (acc: Record<string, number>, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      },
      {}
    );
    return { totalUsers, roleBreakdown };
  },
};
