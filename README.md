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

## What is RateAI?

**RateAI** is a full-stack review, recommendation and discovery platform for the AI-tools
space — _a ratings institution for AI_, in the spirit of Wirecutter or G2 but built for
LLMs, image/video/audio models, coding tools and autonomous agents.

Unlike a flat directory, RateAI rates every tool across **five independent dimensions**
(accuracy, speed, cost-value, ease-of-use and use-case fit) and lets people review a tool
_for the specific job they hired it to do_ — because a model that's great for coding can be
mediocre for writing. A natural-language **AI matchmaker** then turns a plain-English task
("free image generation with an API") into a ranked, explainable shortlist.

It's designed to grow into an ad-supported, SEO-driven content property: a comprehensive,
well-structured, continuously-updated index that people and search engines trust.

> **Brand:** RateAI &nbsp;·&nbsp; **Domain:** `rateaimodel.com`

## What it does

- **Use-case-specific ratings** — every tool scored per job across five dimensions, not one
  blunt star, with denormalised rating aggregates refreshed by a background job.
- **AI matchmaking** — natural-language intent extraction (Google Gemini, structured
  outputs) mapped to a cached, scored shortlist with human-readable match reasons.
- **Verified reviews** — Google OAuth + email verification gate every review; owner
  responses, helpful-votes and moderation are built in.
- **A real content catalogue** — a rich tool model covering pricing, context window,
  modalities, capability flags, benchmarks and provider data, browsable through an
  editorial directory, leaderboard, category indexes and an AI search.
- **Admin CMS** — a separate dashboard where an admin curates the whole site: moderate
  submissions, **bulk-import tools from CSV**, write and publish a **blog**, control
  **site-wide SEO** per page (titles, descriptions, Open Graph, canonical, noindex) with
  live Google/social previews, and manage branding and settings.
- **SEO-first frontend** — dynamic metadata, a programmatic `sitemap.xml` and `robots.txt`,
  per-page and per-post SEO overrides, and article structured data — all controllable from
  the dashboard.
- **A bespoke editorial design system** — a warm, light, type-driven interface
  (serif display + mono data) deliberately distinct from the generic "dark-mode +
  purple-gradient" AI look, applied consistently across the public site and the admin.

## Tech stack

| Layer               | Technology                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| **Frontend**        | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4           |
| **Admin dashboard** | React 19 + Vite SPA                                                     |
| **Backend**         | Node.js, Express 5, TypeScript                                          |
| **Database**        | MongoDB with Mongoose 9                                                 |
| **AI**              | Google Gemini 2.5 Flash (structured-output intent extraction)           |
| **Auth**            | JWT (access + refresh), Firebase / Google OAuth, bcrypt                 |
| **Media & SEO**     | Cloudinary (image uploads), dynamic sitemap/robots, Open Graph, JSON-LD |
| **Libraries**       | Zod validation, Helmet, rate limiting, Winston, Resend, Marked          |
| **Tooling**         | npm workspaces (monorepo), tsdown, tsx, Husky, commitlint, Prettier     |

## Architecture

A TypeScript **monorepo** (npm workspaces) with three applications:

```
rateaimodel/
├── apps/
│   ├── backend/     # Express REST API (/api/v1) — auth, tools, reviews, recommend,
│   │                #   search, categories, users, blog, settings, uploads
│   ├── frontend/    # Next.js public site — the review index, blog and SEO surface
│   └── dashboard/   # Vite admin SPA — moderation, bulk import, blog & SEO CMS
└── tools_data.json  # seed dataset
```

The backend follows a clean `routes → controllers → services → models` layering, with Zod
request validation, centralized error handling and role-based access (`user` / `owner` /
`admin`). The recommendation service extracts structured intent with an LLM, builds a
MongoDB query, scores candidates by overall and per-use-case rating (with a log-scaled
trust signal), and caches results by a hash of the query and filters.

## Engineering highlights

- A **domain-rich data model** that separates underlying models from the products built on
  them, with embedded benchmarks, pricing and per-use-case score aggregates.
- An **LLM recommendation pipeline** with structured outputs, a keyword fallback and a
  cache layer — turning free-text tasks into ranked, explainable matches.
- A safe **CSV bulk-import** pipeline (validate + upsert-by-slug, per-row error reporting)
  that shares one mapper with the seed script so catalogue data never drifts.
- A **dashboard-driven CMS**: a Markdown blog with scheduling and Cloudinary image uploads,
  and a per-page SEO workbench that feeds Next.js metadata, the sitemap and robots in real
  time.
- A cohesive, accessible **editorial design system** carried across the public site and the
  admin dashboard.

## Author

Built by **Kunal** · owned &amp; operated by **Kunamix Digital Solutions**.
