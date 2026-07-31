# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small Express (ESM, `"type": "module"`) API backend for dtales.tech that serves blogs, case studies, and portfolio content out of Supabase (Postgres + Storage), fronted by a JSON file cache. There is no build step, no test suite, and no linter configured in this repo.

## Commands

- `npm start` — runs `node index.js` directly.
- No `npm test`, `npm run build`, or `npm run lint` scripts exist. There are no automated tests in this repo.
- Process management in production uses PM2 via `ecosystem.config.cjs` (the `.js` copy is a stale duplicate — prefer editing the `.cjs` one, since `"type": "module"` in `package.json` means `.js` would normally need to be CJS-compatible via `.cjs`/`require`).

## Required environment

The server calls `process.exit(1)` at startup if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing (see `index.js`), and again if `NODE_ENV=production` but `FRONTEND_URL` is unset. See `.env.example` for the full variable list (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `FRONTEND_URL`, `PORT`, `NODE_ENV`).

**Security note:** `ecosystem.config.js` and `ecosystem.config.cjs` are both committed to git and contain a hardcoded `SUPABASE_SERVICE_ROLE_KEY`. Treat that key as compromised — if you touch these files, pull the secret out into environment variables instead of hardcoding it, and flag to the user that the key should be rotated in Supabase and the git history should be scrubbed if the repo is/becomes public.

## Architecture

### Dual-layer caching: `index.js` cache vs per-route cache

There are **two independent, overlapping caching systems** reading and writing the same files under `cache/` (`portfolio.json`, `blogs.json`, `case_studies.json`):

1. **`index.js`** runs `refreshAllCaches()` once at startup and then every `CACHE_REFRESH_INTERVAL_MS` (5 min) via `setInterval`. It queries Supabase directly and overwrites the cache files.
2. **Each route file** (`routes/blogs.js`, `routes/case-studies.js`, `routes/portfolio.js`) *also* maintains its own in-memory cache variable + its own read/write/clear logic for the *same* JSON files, independently of `index.js`.

When editing caching behavior, changes usually need to be made in **both places** to stay consistent — e.g. the excerpt-building logic (`stripHtml`/`buildExcerpt`) and row normalization (`normalizeBlog`/`normalizeCaseStudy`) are duplicated between `index.js` and the corresponding route file. There's no shared module between them.

Each route's mutating handlers (`POST`/`PUT`/`DELETE`) call `clearCacheFile()` to invalidate that route's cache after a Supabase write, but do NOT trigger `index.js`'s scheduled refresh — the two caches can drift until the next 5-minute tick or an in-route reload.

`GET` handlers read from disk on every request via `loadCachedPortfolio`/`loadCachedBlogs`/`loadCachedCaseStudies` rather than trusting the in-memory variable, so cache files are the actual source of truth for reads; the in-memory cache is a fallback if the file is empty/missing.

### Supabase access pattern

All Supabase reads go through `runSupabaseQuery`/`runSupabaseQueryWithRetry` (duplicated per-file, same shape): wraps each attempt in an `AbortController` timeout (`SUPABASE_TIMEOUT_MS` = 5000ms) and retries up to `SUPABASE_RETRIES` (3) times with a fixed `SUPABASE_RETRY_DELAY_MS` (1000ms) delay. `config/supabase.js` lazily creates and caches a single `SupabaseClient` (`getSupabaseClient()`), returning `null` if env vars are missing rather than throwing — callers must check for `null`.

### No authentication/authorization layer

None of the mutating routes (`POST`/`PUT`/`DELETE` on blogs, case studies, portfolio, uploads) have auth middleware — they're open to anyone who can reach `/api/*`. If adding auth, it needs to be layered in per-router or as global middleware in `index.js`; nothing currently exists to build on.

### Routing map (`index.js`)

- `/api/blogs`, `/api/case-studies`, `/api/portfolio` → CRUD routers backed by the cache system above.
- `/api/uploads` → `routes/uploads.js`, two `multer` memory-storage instances (`imageUpload`, `docxUpload`) that upload directly to Supabase Storage (bucket from `SUPABASE_BUCKET`) and return the public URL. No resizing/transformation happens server-side.
- `/media/:filename` → an image reverse-proxy in `index.js` itself (not a router) that fetches from a **hardcoded** Supabase Storage URL (`SUPABASE_STORAGE_URL` constant) and streams it back with CORS/cache headers rewritten for `https://dtales.tech`. This exists to work around ISP routing issues reaching Supabase directly from the frontend.
- `/api/health`, `/ping` → liveness checks.
- `/debug-supabase` → diagnostic endpoint that DNS-resolves and fetches `SUPABASE_URL`, returning raw error details in the response. Not gated behind auth or `NODE_ENV` — treat as debug-only, don't rely on it in production flows.

### CORS is layered twice

`index.js` sets up `cors(corsOptions)` (allowlist built from `FRONTEND_URL` + `https://dtales.tech` in production, `true`/reflect-all in dev) *and* a manual middleware right after it that unconditionally sets `Access-Control-Allow-Origin: https://dtales.tech` on every response, overriding the `cors()` package's own header. If you need to support another frontend origin, both places need updating — the manual middleware currently hardcodes `dtales.tech` regardless of `FRONTEND_URL`.

### Request-level safety nets in `index.js`

- A global 10s request timeout middleware forces a 504 if a response hasn't finished.
- `no-store`/`no-cache` headers are force-applied to all responses (both globally in `index.js` and again per-router via each route's own `setNoCacheHeaders`).
- `express-rate-limit` (100 req / 15 min) is applied to all of `/api`.
- A heap-usage check runs every 60s and logs a warning above 1GB (no action taken beyond logging).


# DTALES Backend Development Guide

You are the senior backend engineer for the DTALES project.

This is a production backend hosted on a VPS. Every architectural decision should prioritize maintainability, scalability, reliability, and ease of debugging.

## Primary Goal

Refactor the backend into a clean, layered architecture while keeping the production website stable.

Never make unnecessary breaking changes.

Always prefer incremental refactoring over complete rewrites.

---

# Technology Stack

- Node.js
- Express.js
- ES Modules
- Supabase (PostgreSQL + Storage)
- PM2
- Nginx
- Git
- Ubuntu VPS

---

# Architecture Rules

Always follow this architecture.

config/
controllers/
services/
routes/
middleware/
utils/
cache/

Never mix responsibilities.

Routes should only define endpoints.

Controllers should receive requests and return responses.

Services should contain business logic.

Config should only initialize shared resources.

Utils should contain reusable helper functions.

Middleware should contain reusable request middleware.

---

# Coding Standards

Use ES Modules only.

Prefer async/await.

Never duplicate logic.

Keep functions small.

Keep files modular.

Every exported function should have one responsibility.

Avoid deeply nested code.

Write clean readable code.

---

# Error Handling

Never scatter try/catch blocks everywhere.

Use centralized error handling whenever possible.

Create reusable AppError classes.

Every error should include

- service
- message
- status
- timestamp

Errors should be easy to trace.

---

# Logging

Do not use random console.log() calls.

Create a reusable logger.

Every request should log

- timestamp
- endpoint
- service
- execution time
- success/failure

Errors should clearly indicate

- Service Name
- Operation
- Error Type
- Stack (development only)

---

# API Response Standard

Success

{
  "success": true,
  "message": "",
  "data": {}
}

Failure

{
  "success": false,
  "message": "",
  "service": "",
  "code": "",
  "details": ""
}

Every endpoint must use the same response format.

---

# Database

Use only one shared Supabase client.

Never create multiple clients.

Never access process.env directly outside config.

---

# Validation

Validate every incoming request.

Never trust frontend input.

Validation should happen before service logic.

---

# Uploads

All uploads should pass through one Upload Service.

Never duplicate upload logic.

---

# Cache

Cache should be isolated.

Never mix cache logic into controllers.

Services may use cache through reusable helper functions.

---

# Git Workflow

Current development branch

backend-v2-architecture

Never modify main.

Never suggest force pushing.

Never rewrite Git history.

---

# Refactoring Strategy

Refactor one module at a time.

Order

1. Foundation
2. Portfolio
3. Blogs
4. Case Studies
5. Uploads

Never refactor multiple modules simultaneously.

Every module must be tested before moving to the next.

---

# Code Generation Rules

Whenever generating code

- explain why
- keep changes minimal
- preserve existing functionality
- avoid unnecessary dependencies
- avoid overengineering

Always prefer maintainability over clever code.

---

# Communication

Before making architectural changes

Explain

- why
- impact
- files affected
- migration path

Never silently modify project structure.

Always wait for confirmation before making destructive changes.

## Debugging Philosophy

The backend must be designed so that every feature is independently traceable and debuggable.

If a request fails, it should be immediately obvious which layer caused the failure without inspecting unrelated modules.

Every request should be traceable through the following flow:

Request
→ Route
→ Controller
→ Service
→ Cache (if applicable)
→ Database / Storage
→ Response

Each layer should log its own operations and errors with sufficient context.

Logs should clearly identify:

- Request ID
- Timestamp
- Route
- Controller
- Service
- Operation
- Execution Time
- Success / Failure
- Error Message
- Stack Trace (development only)

Services must be loosely coupled.

A failure in one module (Portfolio, Blogs, Case Studies, Uploads, etc.) must not affect any other module.

Each module should be independently testable, maintainable, and replaceable.
## Scalability Philosophy

Every new feature added to the backend should follow the same architecture.

Adding a new module should require only:

- Creating a Service
- Creating a Controller
- Creating Routes
- Registering the Routes

No existing business logic should need modification.

The architecture should scale from 4 APIs to 100+ APIs without requiring structural changes.
## Refactoring Rule

Never change existing functionality unless explicitly instructed.

When refactoring:

- Preserve API behavior.
- Preserve database schema unless requested.
- Preserve response contracts unless migrating all consumers.
- Make small, incremental changes.
- Ensure the application remains functional after each refactoring step.

Every completed step should leave the project in a deployable state.

## Production Safety

This repository is connected to the live production server.

Never:

- restart PM2
- stop PM2
- kill node processes
- start index.js
- run npm start
- bind production ports
- run commands that affect the running service

Do not perform live endpoint verification.

Instead:

- verify syntax
- verify imports
- run isolated unit tests
- mock Express request/response objects
- mock Supabase
- use temporary ports only

Assume port 10000 is production.
