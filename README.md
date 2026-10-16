<p align="center">
  <img src="apps/frontend/public/logo.svg" alt="RateAI" width="220" />
</p>

<h1 align="center">RateAI — The Review Index for AI Tools</h1>

<p align="center">
  Independent, <strong>use-case-specific</strong> ratings for AI tools, models, agents and bots —
  so you choose on evidence, not hype.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2?logo=googlegemini&logoColor=white" />
</p>

---

## Overview

**RateAI** is a full-stack review and recommendation platform for the AI-tools space —
think *"a ratings institution for AI models,"* in the spirit of Wirecutter or G2 but built for
LLMs, image/video/audio models, coding tools and autonomous agents.

Unlike a flat directory, RateAI rates every tool across **five independent dimensions**
(accuracy, speed, cost-value, ease-of-use and use-case fit) and lets people review a tool
*for the specific job they hired it to do* — because a model that's great for coding can be
mediocre for writing. A natural-language **AI matchmaker** then turns a plain-English task
("free image generation with an API") into a ranked shortlist.

> **Naming note:** the brand is **RateAI**; the project ships on the domain **`rateaimodel.com`**.

## Key Features

- **Use-case-specific ratings** — tools scored per job across 5 dimensions, not one blunt star.
- **AI matchmaking** — natural-language intent extraction (Google Gemini, structured outputs)
  mapped to a scored, cached shortlist.
- **Verified reviews** — Google OAuth + email verification gate every review; owner responses,
  helpful-votes and moderation built in.
- **Rich tool model** — pricing, context window, modalities, capability flags, benchmarks and
  provider data, with a denormalized rating-aggregate pipeline.
- **Full browse experience** — editorial directory with live filtering, a leaderboard, category
  indexes and paginated listings.
- **Admin dashboard** — a separate SPA for moderation, submissions review, and a **CSV bulk
  importer** (upsert-by-slug) for curating the catalog at scale.
- **Editorial design system** — a bespoke light, type-driven UI (serif display + mono data),
  deliberately distinct from the generic "dark-mode + purple-gradient" AI look.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Admin** | React 19 + Vite SPA |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | MongoDB with Mongoose 9 |
| **AI** | Google Gemini 2.5 Flash (structured-output intent extraction) |
| **Auth** | JWT (access + refresh), Firebase / Google OAuth, bcrypt |
| **Infra / libs** | Cloudinary (media), Zod (validation), Helmet, rate limiting, Winston, Resend |
| **Tooling** | npm workspaces (monorepo), tsdown, tsx, Husky, commitlint, Prettier |

## Architecture

A TypeScript **monorepo** (npm workspaces) with three deployable apps:

```
rateaimodel/
├── apps/
│   ├── backend/     # Express REST API  (/api/v1) — auth, tools, reviews,
│   │                #   recommend, search, categories, users
│   ├── frontend/    # Next.js public site (the review index)
│   └── dashboard/   # Vite admin SPA (moderation + bulk import)
└── tools_data.json  # seed dataset
```

**Backend layering:** `routes → controllers → services → models`, with Zod request
validation, centralized error handling, and role-based access (`user` / `owner` / `admin`).
The recommendation service extracts structured intent with an LLM, builds a MongoDB query,
scores candidates by overall + per-use-case rating (with a log-scaled trust signal), and
caches results by a SHA-256 of the query + filters.

## Getting Started

**Prerequisites:** Node 20+, a MongoDB connection string, and (optional) Gemini / Cloudinary / Firebase keys.

```bash
# 1. Install all workspaces
npm install

# 2. Configure environment
cp .env.example .env        # fill in DATABASE_URL, GEMINI_API_KEY, etc.

# 3. Seed the catalog (optional)
npm run dev:backend         # then, in another shell:
#   npx tsx apps/backend/src/seed.ts

# 4. Run backend + frontend together
npm run dev
#   frontend → http://localhost:3000
#   backend  → http://localhost:<API port>
```

Run the admin dashboard separately with `npm run dev --workspace=apps/dashboard`.

## Engineering Highlights

- Designed a **domain-rich data model** that separates underlying models from the products
  built on them, with per-use-case score aggregates refreshed by a background job.
- Built an **LLM recommendation pipeline** with structured outputs, a keyword fallback, and a
  cache layer — turning free-text tasks into ranked, explainable matches.
- Implemented a safe **CSV bulk-import** endpoint (validate + upsert-by-slug, per-row error
  reporting) sharing one mapper with the seed script so data never drifts.
- Shipped a cohesive, accessible **editorial design system** (tokens, serif/sans/mono type
  scale, flat hairline components) across ~11 pages, light and responsive.

## Author

Built by **Kunal** · owned & operated by **Kunamix Digital Solutions**.

---

<sub>This project is a personal/portfolio build. Not affiliated with the AI tools it indexes.</sub>
