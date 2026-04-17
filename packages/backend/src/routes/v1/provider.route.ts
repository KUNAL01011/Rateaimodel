import { Router } from "express";
import {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/controllers/provider.controller";
import { validate, authenticate, authorize } from "@/middlewares";
import { createProviderSchema, updateProviderSchema, providerQuerySchema } from "@/validators/provider.validator";

const router = Router();

// GET  /v1/providers         — public: list all providers
router.get("/", validate(providerQuerySchema, "query"), getProviders);

// GET  /v1/providers/:slug   — public: single provider
router.get("/:slug", getProvider);

// POST /v1/providers         — admin only
router.post("/", authenticate, authorize("admin"), validate(createProviderSchema), createProvider);

// PUT  /v1/providers/:slug   — admin only
router.put("/:slug", authenticate, authorize("admin"), validate(updateProviderSchema), updateProvider);

// DELETE /v1/providers/:slug — admin only
router.delete("/:slug", authenticate, authorize("admin"), deleteProvider);

export default router;