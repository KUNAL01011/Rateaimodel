import crypto from "crypto";
import dns from "dns/promises";
import { Tool, ToolOwnership, OwnershipClaim } from "@/models";
import { ApiError } from "@/utils";

export const ownershipService = {
   async submitClaim(userId: string, toolId: string, verificationMethod: string, verificationValue: string) {
    const tool = await Tool.findById(toolId);
    if (!tool) throw new ApiError(404, "Tool not found");
 
    // Already owned by someone else?
    const alreadyOwned = await ToolOwnership.findOne({ toolId });
    if (alreadyOwned) throw new ApiError(409, "This tool already has a verified owner");
 
    // Already has pending claim from this user?
    const pendingClaim = await OwnershipClaim.findOne({ toolId, userId, status: "pending" });
    if (pendingClaim) throw new ApiError(409, "You already have a pending claim for this tool");
 
    const verificationToken = `rateai-verify=${crypto.randomBytes(16).toString("hex")}`;
 
    return OwnershipClaim.create({
      toolId,
      userId,
      status: "pending",
      verificationMethod,
      verificationToken,
      verificationValue,
      submittedAt: new Date(),
    });
  },

  async submitNewListing(userId: string, data: {
    name: string;
    shortDescription: string;
    fullDescription?: string;
    websiteUrl: string;
    logoUrl?: string;
    verificationMethod: string;
    verificationValue: string;
    toolType?: string;
    pricingType?: string;
    hasFreeTier?: boolean;
    hasApi?: boolean;
  }) {
    // Check no existing tool with same name
    const existing = await Tool.findOne({ name: { $regex: new RegExp(`^${data.name}$`, "i") } });
    if (existing) {
      // Guide them to claim the existing listing instead
      throw new ApiError(
        409,
        `A listing for "${data.name}" already exists. Please use "Claim listing" instead.`
      );
    }
 
    // Generate slug from name
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let slug = baseSlug;
    let attempt = 0;
    while (await Tool.findOne({ slug })) {
      slug = `${baseSlug}-${++attempt}`;
    }
 
    const verificationToken = `rateai-verify=${crypto.randomBytes(16).toString("hex")}`;
 
    // Create the tool in unverified state
    const tool = await Tool.create({
      slug,
      name: data.name,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      websiteUrl: data.websiteUrl,
      logoUrl: data.logoUrl,
      toolType: data.toolType ?? "multimodal_tool",
      pricingType: data.pricingType ?? "freemium",
      hasFreeTier: data.hasFreeTier ?? false,
      hasApi: data.hasApi ?? false,
      verificationStatus: "unverified",
    });
 
    // Create claim for this new tool
    const claim = await OwnershipClaim.create({
      toolId: tool._id,
      userId,
      status: "pending",
      verificationMethod: data.verificationMethod,
      verificationToken,
      verificationValue: data.verificationValue,
      submittedAt: new Date(),
    });
 
    return { tool, claim };
  },

   async verifyDns(claimId: string) {
    const claim = await OwnershipClaim.findById(claimId);
    if (!claim) throw new ApiError(404, "Claim not found");
    if (claim.verificationMethod !== "dns_txt_record") {
      throw new ApiError(400, "This claim uses a different verification method");
    }
 
    try {
      const records = await dns.resolveTxt(claim.verificationValue!);
      const flat = records.flat();
      const found = flat.some((r) => r.includes(claim.verificationToken!));
      return { verified: found, records: flat };
    } catch {
      return { verified: false, records: [] };
    }
  },

  async reviewClaim(claimId: string, adminId: string, status: "approved" | "rejected", rejectionReason?: string) {
    const claim = await OwnershipClaim.findById(claimId);
    if (!claim) throw new ApiError(404, "Claim not found");
    if (claim.status !== "pending") throw new ApiError(400, "Claim is already reviewed");
 
    claim.status = status;
    claim.reviewedAt = new Date();
    claim.reviewedById = adminId as any;
    if (status === "rejected") claim.rejectionReason = rejectionReason;
    await claim.save();
 
    if (status === "approved") {
      // Create the active ownership record
      await ToolOwnership.create({
        toolId: claim.toolId,
        userId: claim.userId,
        grantedById: adminId,
      });
 
      // Update tool verification status
      await Tool.findByIdAndUpdate(claim.toolId, {
        verificationStatus: "claimed",
        role: "owner",
      });
 
      // Upgrade user role to owner
      await import("@/models").then(({ User }) =>
        User.findByIdAndUpdate(claim.userId, { role: "owner" })
      );
    }
 
    return claim;
  },

   async getAllClaims({ page = 1, limit = 20, status }: { page?: number; limit?: number; status?: string }) {
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      OwnershipClaim.find(filter)
        .populate("toolId", "name slug")
        .populate("userId", "username email displayName")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      OwnershipClaim.countDocuments(filter),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },
 
  /* ── Get my claims ── */
  async getMyClaims(userId: string) {
    return OwnershipClaim.find({ userId })
      .populate("toolId", "name slug logoUrl verificationStatus")
      .sort({ submittedAt: -1 });
  },
 
  /* ── Get tools I own ── */
  async getMyOwnedTools(userId: string) {
    return ToolOwnership.find({ userId })
      .populate("toolId", "name slug logoUrl ratingOverall reviewsCount verificationStatus")
      .sort({ grantedAt: -1 });
  },
 
  /* ── Revoke ownership (admin) ── */
  async revokeOwnership(toolId: string, _adminId: string) {
    const ownership = await ToolOwnership.findOneAndDelete({ toolId });
    if (!ownership) throw new ApiError(404, "Ownership record not found");
 
    await Tool.findByIdAndUpdate(toolId, { verificationStatus: "unverified" });
    return ownership;
  },
}