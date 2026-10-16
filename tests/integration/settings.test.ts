import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeAdmin, makeUser } from "../helpers/factories";

useTestDb();

describe("Site settings API", () => {
  const BASE = "/api/v1/settings";

  it("auto-creates settings with sensible defaults on first GET", async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body.data.siteName).toBe("RateAI");
    expect(res.body.data.blogEnabled).toBe(true);
    expect(res.body.data.titleTemplate).toContain("%s");
  });

  it("requires admin to update", async () => {
    expect((await request(app).put(BASE).send({ siteName: "X" })).status).toBe(401);
    const { cookie } = await makeUser();
    expect((await request(app).put(BASE).set("Cookie", cookie).send({ siteName: "X" })).status).toBe(403);
  });

  it("updates settings incl. per-page SEO for an admin", async () => {
    const { cookie } = await makeAdmin();
    const res = await request(app)
      .put(BASE)
      .set("Cookie", cookie)
      .send({
        siteName: "RateAI Model",
        googleAnalyticsId: "G-TEST123",
        pageSeo: [{ path: "/", title: "Home title", noindex: false }],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.siteName).toBe("RateAI Model");
    expect(res.body.data.googleAnalyticsId).toBe("G-TEST123");
    expect(res.body.data.pageSeo[0].title).toBe("Home title");

    // Persisted
    const again = await request(app).get(BASE);
    expect(again.body.data.siteName).toBe("RateAI Model");
  });
});
