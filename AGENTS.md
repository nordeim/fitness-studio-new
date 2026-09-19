# AGENTS.md

Instructions for AI coding agents working in this repository. Every line answers: "would you get this wrong without being told?" Verified against the toolchain on 2026-09-19.

## Commands

Run from the repo root. Bun is the package manager — use `bun`, never `npm`/`yarn`/`pnpm`.

| Command | What it does |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Dev server on :3000 (Turbopack) |
| `bun run lint` | ESLint 9 (flat config) — must exit clean (no-console / prefer-const / no-unused-vars enforced) |
| `bun run typecheck` | `tsc --noEmit` — must exit clean (the build no longer ignores type errors) |
| `bun run test` | Vitest domain suite (48 tests) |
| `bun run test:coverage` | Same suite with the 100% gate on `src/lib/domain/**` (statements/branches/functions/lines) |
| `bun run db:push` | Push `prisma/schema.prisma` to SQLite (creates `db/custom.db`) |
| `bun run scripts/seed.ts` | Idempotent seed: 4 instructors, 3 memberships, 27 classes |
| `bun run build` | Production build |

A clean check is: `bun run lint && bun run typecheck && bun run test`. CI (`.github/workflows/ci.yml`) runs lint + typecheck + coverage-gated tests + db push/seed + build on every push/PR to main. Fresh-clone bootstrap: `cp .env.example .env && bun install && bun run db:push && bun run scripts/seed.ts && bun run dev`.

## Architecture invariants

- **Single Next.js 16 App Router app** (no monorepo). Server Components by default; `"use client"` only on interactive leaves (`src/components/site/*`).
- **Mutations go through Server Actions in `src/actions/`** that return `ActionResult<T>` from `@/lib/result` — never throw across the client boundary, never REST endpoints for UI mutations.
- **Domain logic is pure and lives in `src/lib/domain/`** (`class-filters.ts`, `booking-rules.ts`, `discipline-wheel.ts`, `testimonial-spotlight.ts`, `not-found.ts`, `reset-policy.ts`, `reset-delivery.ts`) — no I/O, no Prisma imports; this is the unit-tested seam, held to 100% coverage by `bun run test:coverage`.
- **Money is integer minor units (cents)** everywhere. `formatMoney(2800) === "$28"`. Floats never touch money paths.
- **Booking capacity + duplicate checks run inside `db.$transaction`** in `src/actions/bookings.ts` — the read of `spotsTaken`, the guard, and the increment are one transaction; `@@unique([userId, classId])` is the last-line defense. **Re-booking after cancellation re-activates the cancelled row** (`planBookingWrite` in `lib/domain/booking-rules.ts` returns `reactivate`) — a fresh `create` would collide with the unique key the cancelled row occupies forever.
- **Dependency direction**: `app/ → components/ → lib/domain/ → lib/db`. `lib/domain` must not import the db client (it stays pure/testable).

## Framework quirks (verified the hard way)

- **Next.js 16**: `searchParams` and `cookies()` are async — always `await` them (see `src/app/classes/page.tsx`). Page files may export only `default` + `metadata`/`generateMetadata`/`dynamic` — extra exports fail the build.
- **`'use server'` files may export ONLY async functions.** Re-exporting a sync helper (e.g. `export { spotsLeft }`) from an actions file breaks every route that imports it with "Server Actions must be async functions" at runtime, not compile time. Keep helpers in `lib/` and import them from there.
- **Turbopack cache corruption** (panic: "Failed to restore task data") — delete `.next/` and restart the dev server; the error survives reloads otherwise.
- **Tailwind v4 CSS-first**: design tokens live in `src/app/globals.css` `:root` as HSL values extracted from the source site (`--primary: hsl(21 93% 13%)` = espresso `#411401`). There is no `tailwind.config.js` theme extension; `font-heading`/`kicker`/`container-aura`/`coach-panel`/`.animate-breathe`/`.animate-gradientShift` utilities are defined in `globals.css` `@layer utilities`.
- **Source-measured design system** (session 2 parity pass): buttons are `rounded` (6px), `px-6 py-2.5 text-xs tracking-[0.1em]` easing to `0.2em` on hover with an arrow-up-right glyph (`AuraButton`). Page/section headings are Taviraj `font-light` (hero display: `font-extralight`) — **not italic** (only testimonial quotes and Inhale/Exhale are italic). Sections use `max-w-[1400px] mx-auto` with `px-6 md:px-[8vw]` gutters (the `.container-aura` utility).
- **Header is fixed with hide-on-scroll** (`src/components/site/header.tsx`): transparent/white over each page's espresso hero band; past 64px of scroll it swaps to cream+espresso and slides out (`translateY(-100%)`). The menu is a cream dropdown panel (Taviraj 28px links + Book-a-class button + studio hours). While the source leaves the wordmark white-on-cream (near-invisible) when open, the clone switches the chrome to espresso — documented deviation. The closed menu panel carries `inert={!open}` — `aria-hidden` alone left the hidden links tab-focusable (an invisible-focus WCAG violation); the source mounts its links only while open instead.
- **The home page's signature interactions** are measured rebuilds: the disciplines **dial** (sticky circular scrollspy selector; pure math in `lib/domain/discipline-wheel.ts`, click scrolls to the card) with the right-aligned **All classes** button under the card stack, the **coverflow** benefits carousel (h-96 stage; translateX ±340/680/1020, scale 0.92/0.84/0.76; below the stage a desktop-only controls row — round long-arrow prev/next at the gutters flanking a dot rail: active 10px espresso fill, inactive 8px espresso border, passive like the source; mobile stacks all six cards with no controls), the **coaches accordion** (rows of two — each row an independent accordion, default active alternating first/last for the source's diagonal composition; the active card springs to ~807px with `cubic-bezier(0.34,1.56,0.64,1)`, a second-slot card opens mirror-image), the **testimonial spotlight** (photo band under bg-black/20, white kicker/h2, three 260px flip-cards — a ~3s-slot rotation lights one quote at a time while the others dissolve to giant Taviraj numbers; hover/focus freezes the cycle on that card; math in `lib/domain/testimonial-spotlight.ts`), and the **gallery collage** (absolute %-positioned photos, mask-image fades, mouse parallax, lightbox with prev/next/close).
- **Fonts**: Taviraj (headings) + Inter (body) via `next/font/google` with CSS variables `--font-heading`/`--font-body` — do not import Google Fonts via `<link>`.
- **`react-hooks/set-state-in-effect` is enforced**: closing the header menu on navigation is done via per-link `onClick` handlers, not an effect watching `usePathname`.
- **Images** ship as optimized JPGs in `public/images/` (source PNGs were 41 MB; optimized to 3 MB at 1600px/q82). Use `next/image` with `fill` + `sizes`; the hero is the LCP — keep `priority` on it.
- **SQLite has no array columns**: `specialties`/`certifications`/`features` are JSON strings; (de)serialize only through `parseJsonArray`/`serializeJsonArray` in `lib/domain/booking-rules.ts`.

## Conventions that differ from defaults

- `DATABASE_URL` is relative to the schema file: `file:../db/custom.db` (Prisma resolves from `prisma/`, not the repo root).
- Session auth is hand-rolled: scrypt password hashes (`lib/auth/passwords.ts`), opaque random tokens with the DB storing only the SHA-256(token + SESSION_SECRET) fingerprint (`lib/auth/session.ts`). Rotating `SESSION_SECRET` invalidates all sessions. The **password-reset loop is complete**: request → link (email via Resend when `RESEND_API_KEY` is set, otherwise the operator log) → `/login?token=…` new-password card → `resetPasswordAction` (token policy in `lib/domain/reset-policy.ts`; single-use, 1-hour expiry, revokes all sessions on use).
- Password-reset delivery follows `chooseResetChannel` (`lib/domain/reset-delivery.ts`): email via the Resend API when `RESEND_API_KEY` is configured, otherwise the link is logged server-side (`console.info`) — the dev setup. Either way the client never learns whether an account exists.
- Sign-in/sign-up validation errors flow through `toFieldErrors(zodError)` into `ActionResult.error.fieldErrors`; the client maps them to per-field `role="alert"` text.
- The class schedule's filter rails sync to the URL query (`?type=YOGA&day=MONDAY`) — filters are server-rendered from `searchParams`, and `normalizeFilters` case-insensitively normalizes values (the source links in with `?type=Yoga`) and fails open on unknown enum values (renders all classes rather than 500).
- **Legal pages live at `/privacy`, `/terms`, `/accessibility`** (the source's routes) and render the source's cream prose layout — NOT an espresso band: `bg-background pt-24 pb-16`, `max-w-3xl mx-auto px-6 md:px-[8vw]` column, h1 `text-4xl md:text-5xl font-light mb-12` (Title Case), then `space-y-10` sections of h2 `text-2xl font-light mb-4` + body at `text-primary/80`. The header takes `forceSolid` (the source's transparent+white wordmark over the cream field is invisible — same platform bug as its 404). The legacy `/legal/*` paths `permanentRedirect` to them.
- **The 404 matches the source's platform screen**: full-viewport `min-h-screen` slate-50 field (content centered at the viewport midpoint, footer below the fold), slate-300 digits, "Page Not Found", the quoted offending path **without its leading slash** (`formatNotFoundCopy` in `lib/domain/not-found.ts`, read client-side via `usePathname`), white Go Home button — wrapped in AURA chrome. The header takes `forceSolid` there (the source's transparent+white wordmark over the light field is invisible).
- **Toasts are sonner** — the root layout mounts `<Toaster />` from `sonner`; every `toast()` call in site components renders there. The old shadcn `src/components/ui/` + `src/hooks/` scaffold (which caused the two-disjoint-toast-systems bug) was removed in session 8 — there is exactly one of each primitive now.
- **Security headers ship from `next.config.ts`** (X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS; CSP deliberately absent — see PAD §6). `robots.txt` and `sitemap.xml` are generated by `src/app/robots.ts` / `src/app/sitemap.ts` from `SITE_URL`.
- Every inner page except the legal set opens with an espresso hero band (`bg-primary pt-36/44 pb-20/28`) carrying kicker + h1 — the header assumes it (white wordmark over the dark band). Legal pages are the cream-prose exception (see above); they pass `forceSolid` to the header instead.
- **The footer's copyright row is measured from the source**: inside the columns' `py-8 md:py-16` container, `mt-16` above a `border-t border-[#F0EFE9]/90` hairline, `pt-8`, legal links stack on mobile (`flex-col md:flex-row gap-6`), full-opacity `text-xs`.
- Lint and typecheck both ignore `scratch/`, `docs/`, `skills/`, `examples/`, `mini-services/` (reference material, not app code — `eslint.config.mjs` `ignores` + `tsconfig.json` `exclude`, kept in sync).

## Testing

- `bun run test` (or `bunx vitest run`) — pure domain tests across `tests/domain.test.ts` + `tests/reset.test.ts` (filters, booking write plans incl. re-activation, money, JSON columns, discipline-wheel rotation, testimonial spotlight, 404 copy, reset-token policy, reset delivery); expected values are worked examples, never recomputed by the code under test. `vitest.config.ts` scopes the run to `tests/`, excludes `scratch/`, and enforces 100% coverage on `src/lib/domain/**` under `bun run test:coverage`.
- New domain logic goes in `lib/domain/` with tests in `tests/`. Actions/pages are verified with the browser (agent-browser flow: sign-up → book → cancel is the golden path; the reset loop is request → link → new password → sign in).

## Environment

`.env.example` documents all variables: `DATABASE_URL`, `SESSION_SECRET` (falls back to a dev constant — set a real `openssl rand -base64 32` value in production), `SITE_URL` (canonical origin for sitemap/OG/reset links), and the optional `RESEND_API_KEY` + `AURA_EMAIL_FROM` pair that switches password-reset delivery from the operator log to real email.

## Reference

- `Project_Architecture_Document.md` — the full architecture reference (ADRs, layer model, security model).
- `README.md` — human onboarding and design system.
- `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — how to push to this repo with the SSH wrapper (`docs/ssh_git_wrapper_v3.py`).
