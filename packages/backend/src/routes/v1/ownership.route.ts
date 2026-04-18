import { Router } from "express";
import {
  submitClaim,
  submitNewListing,
  checkDnsVerification,
  getMyClaims,
  getMyOwnedTools,
  getAllClaims,
  reviewClaim,
  revokeOwnership,
} from "@/controllers";
import { validate, authenticate, authorize } from "@/middlewares";
import {
  submitClaimSchema,
  submitNewToolListingSchema,
  reviewClaimSchema,
} from "@/validators";

const router = Router();

// All ownership routes require auth
router.use(authenticate);

// ── Owner: claim an existing listing ─────────────────────────
// POST /v1/ownership/claim
router.post("/claim", validate(submitClaimSchema), submitClaim);

// ── Owner: submit a brand-new tool listing ────────────────────
// POST /v1/ownership/submit-listing
router.post("/submit-listing", validate(submitNewToolListingSchema), submitNewListing);

// ── Owner: check if DNS TXT record is live ────────────────────
// GET /v1/ownership/claims/:claimId/verify-dns
router.get("/claims/:claimId/verify-dns", checkDnsVerification);

// ── Owner: my claims and owned tools ─────────────────────────
// GET /v1/ownership/my-claims
router.get("/my-claims", getMyClaims);

// GET /v1/ownership/my-tools
router.get("/my-tools", getMyOwnedTools);

// ── Admin ─────────────────────────────────────────────────────
// GET  /v1/ownership/claims            — all claims (with optional ?status= filter)
router.get("/claims", authorize("admin"), getAllClaims);

// PUT  /v1/ownership/claims/:claimId   — approve or reject
router.put("/claims/:claimId", authorize("admin"), validate(reviewClaimSchema), reviewClaim);

// DELETE /v1/ownership/tools/:toolId   — revoke ownership
router.delete("/tools/:toolId", authorize("admin"), revokeOwnership);

export default router;