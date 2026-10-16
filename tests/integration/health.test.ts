import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";

describe("GET /health", () => {
  it("returns 200 with status OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body).toHaveProperty("uptime");
  });

  it("returns 404 for an unknown route", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
  });
});
