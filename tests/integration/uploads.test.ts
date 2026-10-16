import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeAdmin, makeUser } from "../helpers/factories";

useTestDb();

// 1x1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

describe("Image upload API (Cloudinary mocked)", () => {
  const URL = "/api/v1/uploads/image";

  it("requires authentication", async () => {
    const res = await request(app).post(URL).attach("image", PNG, "x.png");
    expect(res.status).toBe(401);
  });

  it("rejects non-admins", async () => {
    const { cookie } = await makeUser();
    const res = await request(app).post(URL).set("Cookie", cookie).attach("image", PNG, "x.png");
    expect(res.status).toBe(403);
  });

  it("uploads an image and returns a Cloudinary URL for an admin", async () => {
    const { cookie } = await makeAdmin();
    const res = await request(app)
      .post(URL)
      .set("Cookie", cookie)
      .attach("image", PNG, "x.png");
    expect(res.status).toBe(200);
    expect(res.body.data.url).toContain("res.cloudinary.com");
  });

  it("errors with 400 when no file is attached", async () => {
    const { cookie } = await makeAdmin();
    const res = await request(app).post(URL).set("Cookie", cookie);
    expect(res.status).toBe(400);
  });
});
