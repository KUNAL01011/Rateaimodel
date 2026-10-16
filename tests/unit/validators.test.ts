import { describe, it, expect } from "vitest";
import {
  createToolSchema,
  createBlogSchema,
  bulkImportSchema,
} from "@/validators";

describe("validators", () => {
  describe("createToolSchema", () => {
    const valid = {
      slug: "gpt-4o",
      name: "GPT-4o",
      shortDescription: "Flagship model",
      toolType: "llm_model",
      pricingType: "subscription",
    };

    it("accepts a valid tool", () => {
      expect(createToolSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects an invalid slug", () => {
      const r = createToolSchema.safeParse({ ...valid, slug: "Not A Slug!" });
      expect(r.success).toBe(false);
    });

    it("rejects an unknown toolType", () => {
      const r = createToolSchema.safeParse({ ...valid, toolType: "spaceship" });
      expect(r.success).toBe(false);
    });

    it("rejects a too-long short description", () => {
      const r = createToolSchema.safeParse({ ...valid, shortDescription: "x".repeat(161) });
      expect(r.success).toBe(false);
    });
  });

  describe("createBlogSchema", () => {
    const valid = { title: "Hello", excerpt: "A summary", content: "# Body" };

    it("accepts a valid post", () => {
      expect(createBlogSchema.safeParse(valid).success).toBe(true);
    });

    it("requires title, excerpt and content", () => {
      expect(createBlogSchema.safeParse({ title: "x" }).success).toBe(false);
    });

    it("rejects an invalid status", () => {
      const r = createBlogSchema.safeParse({ ...valid, status: "live" });
      expect(r.success).toBe(false);
    });

    it("accepts optional featured / noindex flags", () => {
      const r = createBlogSchema.safeParse({ ...valid, featured: true, noindex: true });
      expect(r.success).toBe(true);
    });
  });

  describe("bulkImportSchema", () => {
    it("requires at least one row", () => {
      expect(bulkImportSchema.safeParse({ rows: [] }).success).toBe(false);
      expect(bulkImportSchema.safeParse({ rows: [{ Name: "x" }] }).success).toBe(true);
    });
  });
});
