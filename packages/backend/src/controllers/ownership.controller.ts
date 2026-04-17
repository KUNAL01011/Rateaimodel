import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { ownershipService } from "@/services";

/* ── FLOW A: Claim an existing listing ── */
export const submitClaim = asyncHandler(async (req: Request, res: Response) => {
  const { toolId, verificationMethod, verificationValue } = req.body;
  const claim = await ownershipService.submitClaim(
    req.userId!,
    toolId,
    verificationMethod,
    verificationValue
  );
  return res.status(201).json(
    new ApiResponse(201, claim,
      `Claim submitted. Add this TXT record to your DNS: ${claim.verificationToken}`)
  );
});

/* ── FLOW B: Submit a brand-new tool listing ── */
export const submitNewListing = asyncHandler(async (req: Request, res: Response) => {
  const result = await ownershipService.submitNewListing(req.userId!, req.body);
  return res.status(201).json(
    new ApiResponse(201, result,
      `Tool listing created and claim submitted. Verification token: ${result.claim.verificationToken}`)
  );
});

/* ── Check DNS verification (owner polls this) ── */
export const checkDnsVerification = asyncHandler(async (req: Request, res: Response) => {
  const result = await ownershipService.verifyDns(req.params.claimId as string);
  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      result.verified ? "DNS verified successfully" : "DNS record not found yet"
    )
  );
});

/* ── My claims ── */
export const getMyClaims = asyncHandler(async (req: Request, res: Response) => {
  const claims = await ownershipService.getMyClaims(req.userId!);
  return res.status(200).json(new ApiResponse(200, claims, "Your claims fetched"));
});

/* ── My owned tools ── */
export const getMyOwnedTools = asyncHandler(async (req: Request, res: Response) => {
  const tools = await ownershipService.getMyOwnedTools(req.userId!);
  return res.status(200).json(new ApiResponse(200, tools, "Owned tools fetched"));
});

/* ── Admin: list all claims ── */
export const getAllClaims = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const result = await ownershipService.getAllClaims({
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    status: status as string | undefined,
  });
  return res.status(200).json(new ApiResponse(200, result, "Claims fetched"));
});

/* ── Admin: approve or reject a claim ── */
export const reviewClaim = asyncHandler(async (req: Request, res: Response) => {
  const claim = await ownershipService.reviewClaim(
    req.params.claimId as string,
    req.userId!,
    req.body.status,
    req.body.rejectionReason
  );
  return res.status(200).json(
    new ApiResponse(200, claim, `Claim ${req.body.status}`)
  );
});

/* ── Admin: revoke ownership ── */
export const revokeOwnership = asyncHandler(async (req: Request, res: Response) => {
  await ownershipService.revokeOwnership(req.params.toolId as string, req.userId!);
  return res.status(200).json(new ApiResponse(200, null, "Ownership revoked"));
});