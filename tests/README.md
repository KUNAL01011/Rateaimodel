# Tests

Three layers, all runnable from the repo root.

```
tests/
├── unit/          # pure logic — import mapper, Zod validators (no I/O)
├── integration/   # API tests: Supertest → Express app, in-memory Mongo, mocked externals
├── e2e/           # Playwright journeys against the public site
└── helpers/       # test env, DB lifecycle, external-service mocks, data factories
```

## Running

| Command | What it runs |
|---|---|
| `npm test` | unit + integration (Vitest) |
| `npm run test:unit` | unit only |
| `npm run test:integration` | integration only |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright e2e (starts the frontend automatically) |

Unit and integration are **hermetic**: integration tests spin up an in-memory MongoDB
(`mongodb-memory-server`) per file and mock Gemini, Cloudinary, Firebase and Resend — no
network or secrets required. The first run downloads a MongoDB binary.

E2E needs the Playwright browser once: `npx playwright install chromium`.

## What's covered

- **Unit** — spreadsheet→tool import mapper (type/pricing aliases, flags, modalities,
  use-cases, dates, validation) and the tool/blog/bulk Zod schemas.
- **Integration** — health, auth (login + `/me` + role gating), tools (CRUD, bulk upsert,
  featured/trending, auth gating), reviews, categories, search, AI recommendation,
  blog (draft→publish, scheduling, admin CRUD), site settings, and image upload.
- **E2E** — home, blog and search render; nav routing; footer ownership credit;
  `robots.txt` and `sitemap.xml` are served.

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`:

1. **test** — unit + integration
2. **e2e** — Playwright
3. **deploy** — only after both pass, only on push to `main`: triggers deploy hooks for
   Render (backend) and Vercel (frontend + dashboard).

### Required GitHub secrets

| Secret | Where to get it |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render → backend service → Settings → Deploy Hook |
| `VERCEL_DEPLOY_HOOK_FRONTEND` | Vercel → frontend project → Settings → Git → Deploy Hooks |
| `VERCEL_DEPLOY_HOOK_DASHBOARD` | Vercel → dashboard project → Settings → Git → Deploy Hooks |

> To make tests a true gate, turn **off** automatic Git deploys in the Vercel projects
> (and let Render deploy only via the hook) — otherwise the platforms also auto-deploy on
> push, bypassing the CI gate.
