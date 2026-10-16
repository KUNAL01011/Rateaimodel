import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeAdmin, makeUser, makeTool } from "../helpers/factories";

useTestDb();

describe("Tools API", () => {
  const BASE = "/api/v1/tools";

  it("lists tools (empty, then populated)", async () => {
    let res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body.data.data).toEqual([]);

    await makeTool({ slug: "gpt-4o", name: "GPT-4o" });
    res = await request(app).get(BASE);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.meta.total).toBe(1);
  });

  it("fetches a tool by slug and 404s for missing", async () => {
    await makeTool({ slug: "claude", name: "Claude" });
    const ok = await request(app).get(`${BASE}/claude`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.name).toBe("Claude");

    const missing = await request(app).get(`${BASE}/nope`);
    expect(missing.status).toBe(404);
  });

  describe("create (admin only)", () => {
    const payload = {
      slug: "new-tool",
      name: "New Tool",
      shortDescription: "A new tool",
      toolType: "llm_model",
      pricingType: "free",
    };

    it("rejects unauthenticated requests with 401", async () => {
      const res = await request(app).post(BASE).send(payload);
      expect(res.status).toBe(401);
    });

    it("rejects non-admins with 403", async () => {
      const { cookie } = await makeUser();
      const res = await request(app).post(BASE).set("Cookie", cookie).send(payload);
      expect(res.status).toBe(403);
    });

    it("creates a tool for an admin", async () => {
      const { cookie } = await makeAdmin();
      const res = await request(app).post(BASE).set("Cookie", cookie).send(payload);
      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe("new-tool");
    });

    it("rejects a duplicate slug with 409", async () => {
      const { cookie } = await makeAdmin();
      await request(app).post(BASE).set("Cookie", cookie).send(payload);
      const dup = await request(app).post(BASE).set("Cookie", cookie).send(payload);
      expect(dup.status).toBe(409);
    });
  });

  it("updates and deletes a tool (admin)", async () => {
    const { cookie } = await makeAdmin();
    await makeTool({ slug: "editme", name: "Edit Me" });

    const upd = await request(app)
      .put(`${BASE}/editme`)
      .set("Cookie", cookie)
      .send({ name: "Edited" });
    expect(upd.status).toBe(200);
    expect(upd.body.data.name).toBe("Edited");

    const del = await request(app).delete(`${BASE}/editme`).set("Cookie", cookie);
    expect(del.status).toBe(200);
    const gone = await request(app).get(`${BASE}/editme`);
    expect(gone.status).toBe(404);
  });

  it("bulk-imports tools (upsert by slug) for an admin", async () => {
    const { cookie } = await makeAdmin();
    const rows = [
      { Slug: "gpt-4o", Name: "GPT-4o", "Short Description": "Flagship", "Tool Type": "llm", "Pricing Type": "paid", Provider: "OpenAI" },
      { Name: "Bad Row", "Tool Type": "spaceship", "Pricing Type": "paid" },
    ];
    const res = await request(app).post(`${BASE}/bulk`).set("Cookie", cookie).send({ rows });
    expect(res.status).toBe(200);
    expect(res.body.data.created).toBe(1);
    expect(res.body.data.failed).toBe(1);

    // Re-import updates the existing one
    const again = await request(app).post(`${BASE}/bulk`).set("Cookie", cookie).send({ rows: [rows[0]] });
    expect(again.body.data.updated).toBe(1);
  });

  it("returns featured and trending tools", async () => {
    await makeTool({ slug: "feat", name: "Feat", isFeatured: true });
    await makeTool({ slug: "plain", name: "Plain", isFeatured: false });

    const featured = await request(app).get(`${BASE}/featured`);
    expect(featured.status).toBe(200);
    expect(featured.body.data.every((t: any) => t.isFeatured)).toBe(true);

    const trending = await request(app).get(`${BASE}/trending`);
    expect(trending.status).toBe(200);
    expect(Array.isArray(trending.body.data)).toBe(true);
  });
});
