import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeUser, makeTool } from "../helpers/factories";

useTestDb();

describe("AI recommendation API (Gemini mocked)", () => {
  const URL = "/api/v1/recommend";

  it("requires authentication", async () => {
    const res = await request(app).post(URL).send({ task_description: "best tool for coding" });
    expect(res.status).toBe(401);
  });

  it("returns ranked recommendations for a task", async () => {
    const { cookie } = await makeUser();
    await makeTool({
      slug: "coder",
      name: "Coder",
      ratingOverall: 4.5,
      reviewsCount: 10,
      useCaseCoverage: [{ useCase: "coding_general", confidence: 5 }],
    });

    const res = await request(app)
      .post(URL)
      .set("Cookie", cookie)
      .send({ task_description: "I need the best AI for writing TypeScript code" });

    expect(res.status).toBe(200);
    expect(res.body.data.intent.primary_use_cases).toContain("coding_general");
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(res.body.data.recommendations[0].tool.slug).toBe("coder");
    expect(res.body.data.recommendations[0]).toHaveProperty("matchReason");
  });

  it("exposes the use-case taxonomy", async () => {
    const res = await request(app).get(`${URL}/use-cases`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("development");
  });
});
