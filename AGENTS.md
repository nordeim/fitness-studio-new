# AGENTS.md

Instructions for AI coding agents working in this repository. Every line answers: "would you get this wrong without being told?" Verified against the toolchain on 2026-09-19.

## Commands

Run from the repo root. Bun is the package manager — use `bun`, never `npm`/`yarn`/`pnpm`.

| Command | What it does |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Dev server on :3000 (Turbopack) |
| `bun run lint` | ESLint 9 (flat config) — must exit clean |
| `bun run test` | Vitest domain suite (21 tests) |
| `bun run db:push` | Push `prisma/schema.prisma` to SQLite (creates `db/custom.db`) |
| `bun run scripts/seed.ts` | Idempotent seed: 4 instructors, 3 memberships, 27 classes |
| `bun run build` | Production build |

A clean check is: `bun run lint && bun run test`. Fresh-clone bootstrap: `cp .env.example .env && bun install && bun run db:push && bun run scripts/seed.ts && bun run dev`.

## Architecture invariants

- **Single Next.js 16 App Router app** (no monorepo). Server Components by default; `"use client"` only on interactive leaves (`src/components/site/*`).
- **Mutations go through Server Actions in `src/actions/`** that return `ActionResult<T>` from `@/lib/result` — never throw across the client boundary, never REST endpoints for UI mutations.
- **Domain logic is pure and lives in `src/lib/domain/`** (`class-filters.ts`, `booking-rules.ts`) — no I/O, no Prisma imports; this is the unit-tested seam.
- **Money is integer minor units (cents)** everywhere. `formatMoney(2800) === "$28"`. Floats never touch money paths.
- **Booking capacity + duplicate checks run inside `db.$transaction`** in `src/actions/bookings.ts` — the read of `spotsTaken`, the guard, and the increment are one transaction; `@@unique([userId, classId])` is the last-line defense.
- **Dependency direction**: `app/ → components/ → lib/domain/ → lib/db`. `lib/domain` must not import the db client (it stays pure/testable).

## Framework quirks (verified the hard way)

- **Next.js 16**: `searchParams` and `cookies()` are async — always `await` them (see `src/app/classes/page.tsx`). Page files may export only `default` + `metadata`/`generateMetadata`/`dynamic` — extra exports fail the build.
- **`'use server'` files may export ONLY async functions.** Re-exporting a sync helper (e.g. `export { spotsLeft }`) from an actions file breaks every route that imports it with "Server Actions must be async functions" at runtime, not compile time. Keep helpers in `lib/` and import them from there.
- **Turbopack cache corruption** (panic: "Failed to restore task data") — delete `.next/` and restart the dev server; the error survives reloads otherwise.
- **Tailwind v4 CSS-first**: design tokens live in `src/app/globals.css` `:root` as HSL values extracted from the source site (`--primary: hsl(21 93% 13%)` = espresso `#411401`). There is no `tailwind.config.js` theme extension; `font-heading`/`kicker`/`.animate-breathe` utilities are defined in `globals.css` `@layer utilities`.
- **Fonts**: Taviraj (headings) + Inter (body) via `next/font/google` with CSS variables `--font-heading`/`--font-body` — do not import Google Fonts via `<link>`.
- **`react-hooks/set-state-in-effect` is enforced**: closing the header menu on navigation is done via per-link `onClick` handlers, not an effect watching `usePathname`.
- **Images** ship as optimized JPGs in `public/images/` (source PNGs were 41 MB; optimized to 3 MB at 1600px/q82). Use `next/image` with `fill` + `sizes`; the hero is the LCP — keep `priority` on it.
- **SQLite has no array columns**: `specialties`/`certifications`/`features` are JSON strings; (de)serialize only through `parseJsonArray`/`serializeJsonArray` in `lib/domain/booking-rules.ts`.

## Conventions that differ from defaults

- `DATABASE_URL` is relative to the schema file: `file:../db/custom.db` (Prisma resolves from `prisma/`, not the repo root).
- Session auth is hand-rolled: scrypt password hashes (`lib/auth/passwords.ts`), opaque random tokens with the DB storing only the SHA-256(token + SESSION_SECRET) fingerprint (`lib/auth/session.ts`). Rotating `SESSION_SECRET` invalidates all sessions.
- Password-reset tokens are logged server-side (`console.info`) — there is no SMTP in this deployment; the client never learns whether an account exists.
- Sign-in/sign-up validation errors flow through `toFieldErrors(zodError)` into `ActionResult.error.fieldErrors`; the client maps them to per-field `role="alert"` text.
- The class schedule's filter rails sync to the URL query (`?type=YOGA&day=MONDAY`) — filters are server-rendered from `searchParams`, and `normalizeFilters` fails open on unknown enum values (renders all classes rather than 500).
- Lint ignores `scratch/`, `docs/`, `skills/`, `examples/` (reference material, not app code — `eslint.config.mjs` `ignores`).

## Testing

- `bunx vitest run tests/domain.test.ts` — pure domain tests; expected values are worked examples, never recomputed by the code under test.
- New domain logic goes in `lib/domain/` with tests in `tests/domain.test.ts`. Actions/pages are verified with the browser (agent-browser flow: sign-up → book → cancel is the golden path).

## Environment

`.env.example` documents both variables. `SESSION_SECRET` falls back to a dev constant — set a real `openssl rand -base64 32` value in production or every session fingerprint is predictable.

## Reference

- `Project_Architecture_Document.md` — the full architecture reference (ADRs, layer model, security model).
- `README.md` — human onboarding and design system.
- `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — how to push to this repo with the SSH wrapper (`docs/ssh_git_wrapper_v3.py`).
