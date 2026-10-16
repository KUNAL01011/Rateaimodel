import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeTool } from "../helpers/factories";

useTestDb();

describe("Categories API", () => {
  it("returns the category taxonomy with live counts", async () => {
    await makeTool({ slug: "a", name: "A", toolType: "llm_model" });
    await makeTool({ slug: "b", name: "B", toolType: "image_model" });

    const res = await request(app).get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    const llm = res.body.data.find((c: any) => c.toolType === "llm_model");
    expect(llm.count).toBe(1);
    expect(llm.slug).toBe("llm-model");

    const detail = await request(app).get("/api/v1/categories/llm-model");
    expect(detail.status).toBe(200);
    expect(detail.body.data.count).toBe(1);
  });
});

describe("Search API", () => {
  it("finds tools by name", async () => {
    await makeTool({ slug: "gpt-4o", name: "GPT-4o" });
    await makeTool({ slug: "midjourney", name: "Midjourney" });

    const res = await request(app).get("/api/v1/search?q=gpt");
    expect(res.status).toBe(200);
    const names = res.body.data.data.map((t: any) => t.name);
    expect(names).toContain("GPT-4o");
    expect(names).not.toContain("Midjourney");
  });
});
