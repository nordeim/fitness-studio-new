# Session 12 — The Deployment That 500'd: Standalone SQLite Resolution

Continuation of `docs/session_10.md` / `docs/session_11.md`. Goal: refresh
the workspace (the owner had pushed a session-11 transcript plus a
package-versions commit), re-validate every documented claim against the
codebase, re-login to the live app, sweep for drift — then close the gaps
the audit surfaced, the headline being that **the owner's standalone
deployment was returning 500 on every database-backed route in
production**.

## Recon findings (live unchanged; the deployment was broken)

- **Live site re-verified unchanged since session 8.** Logged in with the
  operator credentials (`sepnetflix2023@outlook.com`) — login succeeds and
  again redirects to `/`. The dashboard the task references still does not
  exist: there is no dashboard route on the live app, and
  `docs/fitness-studio-new-dashboard.png` is absent from the repo and from
  GitHub (raw 404) — consistent with sessions 4–11. The authenticated menu
  is identical to the public one (Classes / Pricing / Instructors /
  BOOK A CLASS — no account links). Classes, pricing, instructors, and the
  404 all match the clone's current build modulo the documented
  divergences. The parity target remains the public site plus the
  authenticated booking flows.
- **The owner's session-11 commit changed the delivery model** (commit
  `982b0bf`, author `heinazhik`): `output: "standalone"` in
  `next.config.ts`, a build script that copies static/public into
  `.next/standalone/`, a `start` script that runs
  `bun .next/standalone/server.js`, a `package-lock.json` alongside
  `bun.lock`, `prisma/migrations/` with an init migration plus
  `db:migrate`/`db:reset` scripts, version bumps (Next 16.3.5, vitest 5,
  TypeScript 5.9), `sharp` as a runtime dependency — and a real `.env`
  force-committed past `.gitignore` carrying a live `SESSION_SECRET` and
  `SITE_URL=https://fitness-studio.jesspete.shop`. `docs/start_server_log.txt`
  documents their local run (npm ci → bun install → db:migrate → db:push →
  build — no seed step).
- **The deployed site (fitness-studio.jesspete.shop) was half-broken:**
  `/`, `/login`, `/api`, `/robots.txt`, security headers, and
  `/_next/image` all answered — but **`/classes` returned 500** (the
  server-rendered digest error), and with it every DB-backed flow (sign-in
  POSTs, `/account` authenticated, booking actions). The static pages had
  baked empty rosters (their database was never seeded at build time).
- **Baseline gates on the fresh tree:** lint clean, typecheck clean, 48/48
  tests, coverage 100×4, `bun install --frozen-lockfile` clean (CI parity),
  production build green at 15 routes including the standalone copy steps.
  `npm audit`: 4 high — sharp (libvips/libheif CVEs, runtime image path)
  and the deepmerge-ts chain inside the Prisma CLI (dev-time only; every
  "fix" is a regression — Prisma 6.12 downgrade or an 8.0.0-RC).

## Root cause (reproduced, then proven with a controlled experiment)

Running the standalone build exactly as the owner does (repo root, `.env`
with `DATABASE_URL=file:../db/custom.db`, `bun .next/standalone/server.js`)
reproduced the 500: `PrismaClientInitializationError: Error code 14: Unable
to open the database file`. Three interacting facts:

1. **The Prisma CLI and the generated client disagree about relative
   `file:` URLs.** The CLI resolves them against `prisma/schema.prisma`
   (so `file:../db/custom.db` = `<repo>/db/custom.db` — where
   `db:push`/`migrate`/the seed put the file). The generated client
   resolves them against its engine cwd, which is
   `path.resolve(dirname, "../../../prisma")` **when that directory
   exists, else the client's own directory**.
2. **Dev/build and standalone take different branches of that rule.** The
   untraced client (dev, CI build) finds `<repo>/prisma` → resolves to
   `<repo>/db/custom.db` → works, which is why every gate and CI run was
   green. The traced client inside `.next/standalone` finds no
   `.next/standalone/prisma`… except:
3. **The build tracer copies `prisma/schema.prisma` into
   `.next/standalone/prisma/`**, and the standalone render workers run
   with `cwd = .next/standalone` (verified with instrumented diagnostics).
   A cwd-based or nearest-schema-based anchor therefore latches onto the
   traced copy and points the database inside `.next` — where it is wiped
   on every rebuild.

An md5-controlled probe (seeded DB placed at each candidate path, one
variable at a time) confirmed the resolution base before any fix, and
confirmed the final fix end-to-end.

## Remediation executed (TDD)

1. **R1 — app-side datasource-URL resolution (the headline fix).**
   `tests/database-url.test.ts` written first (11 worked examples:
   schema-relative anchoring, `./`/bare relative paths, multi-hop `..`
   collapse with POSIX root-clamping, absolute/non-SQLite passthrough,
   blank→fallback, bare `file:` stays loud) — red, then green against the
   new pure module `src/lib/domain/database-url.ts` (no imports; held to
   the 100% domain coverage gate; the first red cycle caught a real
   off-by-one in the root clamp plus one miscounted worked example).
   `src/lib/db.ts` now passes an explicit `datasourceUrl` to PrismaClient,
   anchored by `findSchemaDir`: a bounded walk up from the cwd that
   **skips `prisma/schema.prisma` copies inside `.next`** — a traced copy
   is never the source of truth. Net effect: `file:../db/custom.db`
   resolves to `<repo>/db/custom.db` in dev, build, CI, and the run-in-place
   standalone server; a relocated standalone tree (Docker `WORKDIR /app`)
   anchors at its traced `/app/prisma` (mount `/app/db` as a volume); and
   absolute `DATABASE_URL` values pass through untouched — the
   CI/container escape hatch. No workflow change required on the server.
2. **R2 — sharp 0.34.5 → 0.35.4** (the audit's own recommendation; clears
   the libvips/libheif high-severity advisories on the runtime image
   path). Both lockfiles regenerated (`bun add` + `npm install
   --package-lock-only`) and kept in sync — CI installs with
   `bun install --frozen-lockfile`, verified green. Standalone
   `/_next/image` verified 200 after the bump. The remaining 3 high
   advisories (deepmerge-ts via `@prisma/config` → prisma CLI) are
   dev-time-only with no non-breaking fix — accepted and documented.
3. **R3 — docs realignment** with the owner's session-11 changes and this
   session's fix: AGENTS/CLAUDE/README/PAD — standalone deployment and the
   URL-resolution semantics (PAD §4.3, §8.1–8.3), the migrations/`db:migrate`
   flow coexisting with `db:push`, the dual-lockfile policy (bun primary,
   npm lockfile for the operator's server workflow), version tables
   (Next 16.3, sharp row), the committed-`.env` deviation with its
   security note (single-operator pull-and-deploy choice; never add
   third-party secrets; rotate if the audience widens), the
   standalone-server cwd + traced-schema gotchas, and test counts
   (48 → 59).
4. **R4 — screenshots refreshed** (all 10 captures, dev server, 1440×900 +
   390×844) on the remediated tree.

## Verification ledger

- **Gates:** lint clean; typecheck clean; 59/59 tests; coverage
  100/100/100/100 on `src/lib/domain/**` (including the new
  `database-url.ts`); `bun install --frozen-lockfile` clean;
  `npm audit` down from 4 to 3 high (all three in the Prisma CLI's dev-time
  dependency chain); production build green at 15 routes.
- **Standalone E2E (the owner's exact flow — `env`-clean, `.env` relative
  URL, `bun .next/standalone/server.js` from the repo root):** all 12
  routes answer 200/307/404 as designed; `/classes` renders the full
  seeded schedule; `/_next/image` 200 (sharp 0.35.4).
- **Golden path on the standalone build:** sign-up → redirect to
  `/account` → book (sonner toast) → cancel (toast) → re-book → exactly
  one re-activated `confirmed` row (the session-4 unique-key fix holds
  through the new datasource path). Writes verified in
  `<repo>/db/custom.db` by direct SQLite read — outside `.next`,
  persistent across rebuilds.
- **Dev-server sweep for the screenshots:** every route captured from the
  live remediated tree, including the reset-password card (fresh
  single-use token via the operator-log channel) and an authenticated
  account with a booking.

## Deviation note (unchanged; one addition)

The accepted deviations stand: forceSolid header on legal/404 pages, the
clone's account entry points (menu + footer), seeded data where the live
collections are empty, original legal copy, the branded login screen — and
now the operator's committed `.env` (documented above and in AGENTS.md /
PAD §8.2). The live app remains unchanged, so parity needed no visual work
this session; the delta was the operator's deployment stack.

## Server operator checklist (to pick up the fix)

`git pull` → `bun install` → `bun run db:migrate` (or `db:push`) →
`bun run scripts/seed.ts` (idempotent; the deployed database is currently
empty, which is why even the fixed `/classes` would show the empty state)
→ `rm -rf .next && bun run build` (clean tree — repeated builds merge
chunks into `.next/standalone`) → `bun run start`.
