import { Provider } from "@/models";
import { ApiError } from "@/utils";

export const providerService = {
  async getAll({
    page = 1,
    limit = 20,
    search,
    sortBy = "name",
    sortOrder = "asc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Provider.find(filter).sort(sort).skip(skip).limit(limit),
      Provider.countDocuments(filter),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getBySlug(slug: string) {
    const provider = await Provider.findOne({ slug });
    if (!provider) throw new ApiError(404, "Provider not found");
    return provider;
  },

  async create(data: any) {
    const exists = await Provider.findOne({
      $or: [{ slug: data.slug }, { name: data.name }],
    });

    if (exists)
      throw new ApiError(409, "Provider with this name or slug already exists");
    return Provider.create(data);
  },

  async update(slug: string, data: any) {
    const provider = await Provider.findOneAndUpdate({ slug }, data, {
      new: true,
      runValidators: true,
    });
    if (!provider) throw new ApiError(404, "Provider not found");
    return provider;
  },

  async delete(slug: string) {
    const provider = await Provider.findOneAndDelete({ slug });
    if (!provider) throw new ApiError(404, "Provider not found");
    return provider;
  },
};
