import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeAdmin } from "../helpers/factories";

useTestDb();

describe("Blog API", () => {
  const BASE = "/api/v1/blog";
  const draft = {
    title: "How to pick an LLM",
    excerpt: "A practical guide to choosing the right model.",
    content: "## Intro\n\nSome **markdown** content here.",
  };

  it("starts with an empty public feed", async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body.data.data).toEqual([]);
  });

  it("requires admin to create a post", async () => {
    const res = await request(app).post(BASE).send(draft);
    expect(res.status).toBe(401);
  });

  it("creates a draft (hidden from public) then publishes it", async () => {
    const { cookie } = await makeAdmin();

    const created = await request(app).post(BASE).set("Cookie", cookie).send(draft);
    expect(created.status).toBe(201);
    const id = created.body.data._id;
    const slug = created.body.data.slug;
    expect(created.body.data.status).toBe("draft");
    expect(created.body.data.readingMinutes).toBeGreaterThanOrEqual(1);

    // Draft is not public
    expect((await request(app).get(BASE)).body.data.data).toHaveLength(0);
    expect((await request(app).get(`${BASE}/${slug}`)).status).toBe(404);

    // Admin can still read it
    const adminRead = await request(app).get(`${BASE}/admin/${slug}`).set("Cookie", cookie);
    expect(adminRead.status).toBe(200);

    // Publish
    const published = await request(app).put(`${BASE}/${id}`).set("Cookie", cookie).send({ status: "published" });
    expect(published.status).toBe(200);
    expect(published.body.data.status).toBe("published");
    expect(published.body.data.publishedAt).toBeTruthy();

    // Now public
    const feed = await request(app).get(BASE);
    expect(feed.body.data.data).toHaveLength(1);
    expect((await request(app).get(`${BASE}/${slug}`)).status).toBe(200);
  });

  it("keeps future-scheduled posts out of the public feed", async () => {
    const { cookie } = await makeAdmin();
    const future = new Date(Date.now() + 86400000).toISOString();
    await request(app).post(BASE).set("Cookie", cookie).send({
      ...draft,
      title: "Scheduled",
      status: "published",
      publishedAt: future,
    });
    const feed = await request(app).get(BASE);
    expect(feed.body.data.data).toHaveLength(0);
  });

  it("lists all posts for admin and deletes one", async () => {
    const { cookie } = await makeAdmin();
    const created = await request(app).post(BASE).set("Cookie", cookie).send(draft);
    const id = created.body.data._id;

    const all = await request(app).get(`${BASE}/admin`).set("Cookie", cookie);
    expect(all.status).toBe(200);
    expect(all.body.data.data.length).toBeGreaterThanOrEqual(1);

    const del = await request(app).delete(`${BASE}/${id}`).set("Cookie", cookie);
    expect(del.status).toBe(200);
  });
});
