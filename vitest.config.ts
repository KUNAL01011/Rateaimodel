import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
    ],
    setupFiles: ["tests/helpers/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 120000, // first run downloads the mongodb-memory-server binary
    fileParallelism: false, // one in-memory Mongo at a time
    pool: "forks",
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "apps/backend/src"),
    },
  },
});
