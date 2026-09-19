---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs-single-app
version: 1.0.0
last_updated: 2026-09-19
---

# AURA Studio — Fitness Studio Clone

Production clone of `fitness-studio.base44.app` ("AURA Studio"), a women-only boutique fitness studio: marketing site, class schedule with booking, memberships & pricing, instructor profiles, and member accounts. Single Next.js 16 App Router application with Prisma + SQLite and hand-rolled session auth. The clone preserves the source app's design tokens (espresso/cream/butter palette, Taviraj + Inter) and its four domain entities (StudioClass, Instructor, Membership, Booking).

**Stack**: Bun · Next.js 16.3 (App Router, Turbopack, `output: "standalone"`) · React 19 (strict mode) · TypeScript 5 (strict — `bun run typecheck` must be clean; the build does not ignore errors) · Tailwind CSS v4 (CSS-first) · Prisma 6 + SQLite · Zod 4 · Vitest (coverage-gated) · sonner (toasts) · sharp (runtime image optimization for the standalone server).

## Foundational Principles

1. **Server is the source of truth.** RSC pages read via `db` directly; prices, capacities, and filters are derived server-side. Client components hold only interaction state (active tab, pending flags).
2. **Actions never throw across the wire.** Every server action returns `ActionResult<T>` (`{ ok: true, data } | { ok: false, error }`) from `@/lib/result`. Unexpected errors are caught in `withResult`, logged server-side with context, and surfaced to the client as customer-safe copy.
3. **Money is integers.** All amounts are integer minor units; `formatMoney()` is the only formatter. Never introduce floats into money paths.
4. **Domain logic is pure.** `src/lib/domain/` modules import nothing but types — they are the unit-tested seam. I/O (Prisma, cookies, headers) lives in actions and pages.
5. **Honest UI.** Empty/loading/error states are explicit ("No classes match your filters", "Fully booked", "Sign in to book"). No fake data, no placeholder copy.

## Implementation Standards

### TypeScript (strict)

- `strict` on; avoid `any` (use `unknown`). Prefer `interface` for object shapes, `type` for unions.
- Type-only imports use `import type` inline.
- Domain functions validate inputs at boundaries (Zod schemas in `@/lib/validation` guard every action).

### Next.js 16 specifics

- `searchParams`, `cookies()` are **async** — always `await` (see `src/app/classes/page.tsx`).
- Page files export only `default` + `metadata`/`generateMetadata`/`dynamic`. Extra exports break the build.
- **`'use server'` modules export ONLY async functions** — a sync re-export (`export { spotsLeft }`) from an actions file fails at runtime with "Server Actions must be async functions". Helpers live in `lib/`.
- Server Components by default; `"use client"` only for interactive leaves.
- Mutations via Server Actions in `src/actions/*`, never route handlers. The only route handlers are under `src/app/api/` (scaffold health checks).
- `revalidatePath('/classes')` + `revalidatePath('/account')` after booking mutations.
- Toasts render through **sonner** — the root layout mounts `<Toaster />` from `sonner` (bottom-right). The shadcn `ui/toaster` is NOT mounted; calling `useToast` would be a silent no-op.

### Tailwind v4 (CSS-first)

- No `tailwind.config.*` exists (deleted in session 10 — the scaffold remnant imported the purged `tailwindcss-animate` and broke fresh-clone typecheck/build/CI) — tokens live in `src/app/globals.css` `:root` (HSL, extracted from the source app) and map through `@theme inline`.
- Custom utilities (`.font-heading`, `.kicker`, `.container-aura`, `.coach-panel`, `.animate-breathe`, `.animate-gradientShift`, `.scroll-elegant`) are defined in `@layer utilities` in `globals.css`.
- **Measured design system**: buttons `rounded` + `px-6 py-2.5 text-xs tracking-[0.1em]→[0.2em]` hover with arrow-up-right (`AuraButton`); headings Taviraj `font-light` non-italic (hero `font-extralight`); kickers `text-xs tracking-[0.3em]`; section gutters `max-w-[1400px] px-6 md:px-[8vw]` (`.container-aura`). Legal pages are the layout exception: the source's cream prose page (`max-w-3xl` column, h1 `text-4xl md:text-5xl font-light`, `space-y-10` h2 sections) with `forceSolid` header — no espresso band. The benefits coverflow keeps its controls row below the stage (long-arrow buttons + passive dot rail, desktop only; mobile stacks all cards). Coaches render in rows of two, each row an independent accordion. The footer copyright row sits `mt-16` under a `border-[#F0EFE9]/90` hairline with stacked-on-mobile legal links.
- `prefers-reduced-motion` disables the breathe/gradientShift/char-rise animations.
- Fonts via `next/font/google` (Taviraj 200–500 + italic, Inter 300–600) exposed as `--font-heading`/`--font-body` — never `<link>` Google Fonts.

### Data layer (Prisma + SQLite)

- Schema at `prisma/schema.prisma`. Two supported flows: `bun run db:push` (schema push — the CI flow) and `bun run db:migrate` / `db:reset` (migration-based — `prisma/migrations/` exists with the init migration; the operator's server flow).
- **Relative `file:` URLs are resolved app-side** (`src/lib/db.ts` passes an explicit `datasourceUrl`): the pure `resolveDatabaseUrl` (`lib/domain/database-url.ts`) anchors the URL at the real `prisma/schema.prisma` directory — found by walking up from the cwd while **skipping traced copies inside `.next`** — because the Prisma CLI and the generated client disagree about relative SQLite paths, and the standalone server's workers run with `cwd = .next/standalone`. Absolute `DATABASE_URL` values pass through untouched.
- SQLite has no arrays or enums as strings columns: `specialties`/`certifications`/`features` are JSON strings; (de)serialize ONLY via `parseJsonArray`/`serializeJsonArray`.
- Booking writes run inside `db.$transaction`: guard (capacity + duplicate) and `spotsTaken` increment/decrement commit atomically. `@@unique([userId, classId])` backs the duplicate guard — and because a cancelled row keeps occupying that key forever, `planBookingWrite` (`lib/domain/booking-rules.ts`) plans a **reactivate** (row update) instead of a create when the member re-books a previously cancelled class.
- Seed (`scripts/seed.ts`) is idempotent — instructor/membership upserts by stable id, classes by natural key (title + day + startTime). Safe to re-run.

### Authentication

- scrypt password hashing (`src/lib/auth/passwords.ts`), self-describing format `scrypt$N$r$p$salt$hash`.
- Opaque session tokens: 32 random bytes in an httpOnly cookie; the DB stores `sha256(token + SESSION_SECRET)` — a DB leak is not session forgery.
- `getCurrentUser()` resolves the member per request and sweeps expired sessions opportunistically.
- Uniform "Invalid email or password" (no account-existence oracle); password-reset confirmation is likewise unconditional.
- **Complete reset loop**: `requestPasswordResetAction` creates a single-use 1-hour token and delivers the link by email (Resend, when `RESEND_API_KEY` is set) or the operator log; `/login?token=…` opens the new-password card; `resetPasswordAction` validates the token via the pure `validateResetTokenState` policy, rehashes the password, marks the token used, and revokes every session for the member — all in one transaction.
- Security headers (X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS) ship from `next.config.ts`; CSP is deliberately absent (Next.js App Router requires inline bootstrap scripts — see PAD §6.4).

## Development Workflow

### Environment Setup

```bash
cp .env.example .env          # set SESSION_SECRET: openssl rand -base64 32
bun install
bun run db:push               # create db/custom.db from the schema
bun run scripts/seed.ts       # 4 instructors, 3 memberships, 27 classes
bun run dev                   # http://localhost:3000
```

CI (`.github/workflows/ci.yml`) runs the full gate — lint → typecheck → coverage-gated tests → db push/seed → production build — on every push and PR to `main`.

### Build Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Dev server :3000 (teed to `dev.log`) |
| `bun run lint` | ESLint 9 flat config — must be clean (no-console/prefer-const/no-unused-vars enforced) |
| `bun run typecheck` | `tsc --noEmit` — must be clean |
| `bun run test` | Vitest domain suite (59 tests) |
| `bun run test:coverage` | Suite + 100% coverage gate on `src/lib/domain/**` |
| `bun run db:push` / `bun run db:generate` / `bun run db:migrate` / `bun run db:reset` | Schema lifecycle (push = CI flow; migrate/reset = migration flow) |
| `bun run scripts/seed.ts` | Idempotent seed |
| `bun run build` | Production build (standalone output; static/public copied into `.next/standalone/`) |
| `bun run start` | Standalone production server (teed to `server.log`) |

Clean check order: `bun run lint && bun run typecheck && bun run test`.

## Testing Strategy

| Level | Tool | Location | Notes |
|---|---|---|---|
| Unit | Vitest | `tests/domain.test.ts`, `tests/reset.test.ts`, `tests/database-url.test.ts` | Filters, schedule sorting, time formatting, booking write plans (create/deny/re-activate), cancellation window, money, JSON columns, discipline-wheel rotation, testimonial spotlight, 404 copy, reset-token policy (valid/expired/used/not_found boundaries), reset delivery channel + email builder, SQLite datasource-URL resolution (schema-relative anchoring, passthrough, root-clamping). 100% coverage enforced on `src/lib/domain/**` |
| E2E (manual) | Browser | — | Golden path: sign-up → filter schedule → book → verify "Booked ✓" + toast → cancel from /account → re-book (re-activation). Reset loop: request → open link → new password → sign in → old password rejected → token reuse rejected |

- Expected values in tests are worked examples (e.g. `formatTimeClock('18:45') === '6:45 PM'`), never recomputed by the same code under test.
- New pure logic lands in `lib/domain/` with tests; a red test is a regression or a wrong test — never skip to pass.

## Code Quality Standards

- No `console.log` in app code — ESLint `no-console` enforces it (warn/error/info allowed; the password-reset link log is intentional, see `lib/auth`).
- Caught errors are logged with context (`withResult` labels every action) — silent `catch` blocks are forbidden.
- UI: explicit empty/loading/error states; visible focus rings (`focus-visible:outline-2`); semantic landmarks; `role="status"` for spots-left live region. Buttons measure ~36px tall (source parity, above the 24px WCAG 2.2 AA target minimum); primary controls keep ≥44px targets where the layout allows.
- Accessibility target: WCAG 2.2 AA (cream-on-espresso and espresso-on-cream pairings both clear 4.5:1).

## Git & Version Control

- Branch `main` only (the SSH-wrapper operator contract); Conventional Commits (`feat:`, `fix:`, `docs:`).
- Never commit `db/*.db` or keys. `.env` is the documented exception: the operator deliberately tracks it (force-added past `.gitignore`) so the deploy server is self-contained — keep it free of third-party secrets (`RESEND_API_KEY`, OAuth), and see AGENTS.md "Environment" for the rotation note.
- Pushes to `nordeim/fitness-studio-new` use `docs/ssh_git_wrapper_v3.py` (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`): gates green → commit → dry-run → push → remote verified.

## Error Handling & Debugging

- Action errors: `{ code: 'VALIDATION' | 'UNAUTHENTICATED' | 'NOT_FOUND' | 'CONFLICT' | 'CAPACITY_FULL' | 'INTERNAL', message, fieldErrors? }` — the client toasts `message` and maps `fieldErrors` to inputs.
- Debugging order: reproduce with the exact command → read the dev-server log → isolate at the pure seam (`lib/domain`) with a test → fix the root cause.
- Turbopack panic ("Failed to restore task data"): `rm -rf .next` and restart — the cache, not your code, is corrupt.

## Anti-Patterns to Avoid

- REST route handlers for UI mutations (Server Actions only).
- Floats on money; string-concatenated SQL (`prisma.$queryRaw` with unparameterized input).
- Sync exports from `'use server'` files.
- Effect-body `setState` for close-on-navigate patterns (use per-link `onClick`; the lint rule blocks the effect form).
- Editing `bun.lock` by hand — dependency changes go through `bun add`/`bun remove`.
- Claiming a flow works without browser evidence — the golden path (sign-up → book → cancel) must be exercised, not assumed.
