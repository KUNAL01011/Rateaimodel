import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { useTestDb } from "../helpers/db";
import { makeAdmin, makeUser } from "../helpers/factories";

useTestDb();

describe("Auth API", () => {
  describe("GET /auth/me", () => {
    it("401s without a token", async () => {
      expect((await request(app).get("/api/v1/auth/me")).status).toBe(401);
    });

    it("returns the current user with a valid cookie", async () => {
      const { cookie, user } = await makeAdmin();
      const res = await request(app).get("/api/v1/auth/me").set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(user.email);
    });
  });

  describe("POST /auth/login (admin dashboard)", () => {
    it("logs in an admin with correct credentials", async () => {
      await makeAdmin(); // password: "password123"
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "admin@test.com", password: "password123" });
      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("rejects a wrong password with 401", async () => {
      await makeAdmin();
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "admin@test.com", password: "wrong" });
      expect(res.status).toBe(401);
    });

    it("forbids non-admin accounts with 403", async () => {
      await makeUser({ email: "plain@test.com", password: "password123" });
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "plain@test.com", password: "password123" });
      expect(res.status).toBe(403);
    });
  });
});
