import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeUser, makeTool } from "../helpers/factories";

useTestDb();

describe("Reviews API", () => {
  const BASE = "/api/v1/reviews";
  const body = (toolId: string) => ({
    toolId,
    useCase: "coding_general",
    ratingOverall: 5,
    reviewText:
      "This model is genuinely excellent for day-to-day coding work and refactors.",
    wouldRecommend: true,
  });

  it("requires authentication to create a review", async () => {
    const tool = await makeTool();
    const res = await request(app).post(BASE).send(body(String(tool._id)));
    expect(res.status).toBe(401);
  });

  it("rejects a too-short review body", async () => {
    const { cookie } = await makeUser();
    const tool = await makeTool();
    const res = await request(app)
      .post(BASE)
      .set("Cookie", cookie)
      .send({ ...body(String(tool._id)), reviewText: "too short" });
    expect(res.status).toBe(400);
  });

  it("creates a review and lists it by tool", async () => {
    const { cookie } = await makeUser();
    const tool = await makeTool();

    const created = await request(app).post(BASE).set("Cookie", cookie).send(body(String(tool._id)));
    expect(created.status).toBe(201);

    const list = await request(app).get(`${BASE}/tool/${tool._id}`);
    expect(list.status).toBe(200);
    expect(list.body.data.data.length).toBeGreaterThanOrEqual(1);
    expect(list.body.data.data[0].ratingOverall).toBe(5);
  });
});
