import { vi } from "vitest";

/* ── Environment — set BEFORE any backend module (env.config) is imported ── */
process.env.NODE_ENV = "test";
process.env.PORT = "8080";
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/rateai-test";
process.env.BACKEND_URL = "http://localhost:8080";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n";
process.env.ACCESS_SECRET = "test_access_secret";
process.env.REFRESH_SECRET = "test_refresh_secret";
process.env.ALLOWED_ORIGINS = "http://localhost:3000";
process.env.GEMINI_API_KEY = "test-gemini-key";

/* ── External services are mocked (hermetic, no network / secrets) ── */

vi.mock("firebase-admin", () => {
  const admin = {
    apps: [{}], // non-empty so initializeApp is skipped
    initializeApp: vi.fn(),
    credential: { cert: vi.fn(() => ({})) },
    auth: () => ({
      verifyIdToken: vi.fn(async () => ({
        uid: "firebase-uid",
        email: "oauth@test.com",
        name: "OAuth User",
        picture: "",
      })),
    }),
  };
  return { default: admin, ...admin };
});

vi.mock("@google/generative-ai", () => {
  class GoogleGenerativeAI {
    getGenerativeModel() {
      return {
        generateContent: async () => ({
          response: {
            text: () =>
              JSON.stringify({
                task_type: "coding",
                domain: "development",
                input_size: "short",
                requires_citation: false,
                budget_sensitive: false,
                primary_use_cases: ["coding_general"],
              }),
          },
        }),
      };
    }
  }
  const SchemaType = new Proxy(
    {},
    { get: (_t, p) => String(p).toUpperCase() }
  );
  return { GoogleGenerativeAI, SchemaType };
});

vi.mock("cloudinary", () => {
  const v2 = {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(async () => ({
        url: "http://res.cloudinary.com/test/image/upload/x.png",
        secure_url: "https://res.cloudinary.com/test/image/upload/x.png",
        public_id: "rateai/x",
        width: 1200,
        height: 630,
      })),
      destroy: vi.fn(async () => ({ result: "ok" })),
    },
  };
  return { v2, default: { v2 } };
});

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn(async () => ({ id: "email-id" })) };
  },
}));
