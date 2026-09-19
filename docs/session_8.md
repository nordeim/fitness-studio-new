# Session 8 — Production-Readiness Hardening: The Reset Loop, CI, Coverage, Dead-Code Purge

Continuation of `docs/session_6.md` / `docs/session_7.md`. Goal: refresh the
workspace (`git pull` picked up `session_7.md` — the narrative log of the
session-6 audit), re-validate every documented claim against the codebase, run
a fresh live recon, then close the remaining production-readiness gaps the
prior parity sessions left open (PAD §10): the incomplete password-reset loop,
missing CI, the unenforced coverage claim, and a layer of scaffold debt the
parity work had been carrying.

## Recon findings (live unchanged; codebase debt surfaced)

- **Live site re-verified unchanged since session 6.** Logged in with the
  operator credentials (`sepnetflix2023@outlook.com`) — login again redirects
  to `/` (no dashboard exists; the dashboard PNG still 404s on GitHub). All 9
  routes captured and diffed against the clone: every difference is a
  documented one (seeded data vs the live's empty collections, original legal
  copy, the clone's account entry points). The live 404 copy
  (`The page "does-not-exist" …`, no leading slash), the open menu content
  (Classes / Pricing / Instructors / BOOK A CLASS / studio hours), and the
  classes empty state all still match the clone's current build exactly.
- **Golden path re-verified before touching anything:** fresh account →
  book → toast + "Booked ✓" badge → cancel → toast → re-book → the same
  booking row re-activated (the session-4 fix holds). Zero horizontal
  overflow at 1440px and 390px on all routes.
- **The real gaps this session were engineering gaps, not parity gaps:**
  - `next.config.ts` still carried `typescript: { ignoreBuildErrors: true }` —
    and a real TS2554 sat underneath it (`promisify(scryptCb)` collapses to
    the 3-arg overload; the options-carrying calls in
    `src/lib/auth/passwords.ts` were type errors the build was swallowing).
  - `tsc --noEmit` scanned `skills/` and `docs/` (excluded from checking and
    compilation by the operator contract) and failed on two skill files.
  - **The password-reset loop was incomplete**: `requestPasswordResetAction`
    created a single-use 1-hour token and logged it, but nothing could consume
    a token — no new-password screen, no `resetPasswordAction`. Members could
    request a reset that could never complete.
  - The shadcn `src/components/ui/` tree (48 files) and `src/hooks/` had zero
    imports from the live code — the exact dead scaffold that produced the
    session-4 "two disjoint toast systems" bug was still sitting in the tree,
    along with ~55 unused runtime dependencies (every Radix primitive,
    next-auth, next-intl, framer-motion, recharts, the dnd-kits, mdxeditor…).
  - No security headers, no `sitemap.xml`, a scaffold "Hello, world!" API
    route, `reactStrictMode: false`, ESLint with every quality rule disabled,
    no CI, no coverage gate — and the PAD's "100% coverage by convention"
    claim had never been measured.

## Remediation executed (TDD where logic was involved)

1. **R1+R2 — make typecheck real**: typed the promisified scrypt signature in
   `passwords.ts` (the runtime was always correct; only the typing lied),
   removed `ignoreBuildErrors`, and aligned `tsconfig.json` excludes with the
   eslint ignores (`skills`, `docs`, `scratch`, `examples`, `mini-services`).
   `bun run typecheck` is now a first-class gate and exits clean.
2. **R10a — complete the reset loop (TDD)**: red tests first in
   `tests/reset.test.ts` for two new pure seams —
   `lib/domain/reset-policy.ts` (`validateResetTokenState`: valid / expired
   (boundary: expiry instant is expired) / used (a consumed marker dominates
   expiry) / not_found) — then green. The new `resetPasswordAction` consumes
   a token in one transaction: mark `usedAt`, rehash the password, revoke
   every session for the member (a reset invalidates other devices). The
   auth card gained a fourth mode (`newpass`) deep-linked from
   `/login?token=…`; the login page reads and forwards the token.
3. **R10b — wire email delivery (TDD)**: `lib/domain/reset-delivery.ts`
   (`chooseResetChannel` + `buildResetEmail`; the token never appears in the
   email subject) tested red → green. `requestPasswordResetAction` now builds
   the link from the request origin and delivers it via the Resend API when
   `RESEND_API_KEY` is set — otherwise the operator log, exactly as before.
   Email failures are logged and swallowed: the client sees the same generic
   confirmation either way (no oracle, no mail-outage crash). `.env.example`
   documents `SITE_URL`, `RESEND_API_KEY`, `AURA_EMAIL_FROM`.
4. **R6+R7 — purge the scaffold**: deleted `src/components/ui/` (48 files) and
   `src/hooks/` (zero imports; the session-4 bug source), removed 55 unused
   runtime dependencies. The dependency list is now exactly what the app
   imports (next, react, react-dom, @prisma/client, prisma, zod, sonner,
   clsx, tailwind-merge, lucide-react, sharp).
5. **R3+R4+R5+R11+R13 — harden delivery**: `reactStrictMode: true` (golden
   path re-verified under it); the OWASP header set (X-Frame-Options DENY,
   nosniff, Referrer-Policy, Permissions-Policy, HSTS — CSP deliberately
   absent, rationale documented in PAD §6.1) on every response; env-driven
   `robots.txt` + `sitemap.xml` via `src/app/robots.ts` / `src/app/sitemap.ts`
   with `metadataBase` in the root layout; the API route became a DB-free
   health check; `package.json` identity is now `aura-studio` v1.0.0.
6. **R12 — enforce the documented lint rules**: `no-console` (warn/error/info
   allowed), `prefer-const`, `@typescript-eslint/no-unused-vars` enabled —
   they surfaced 9 real findings (4 seed-script `console.log`s, an unused
   import pair in `auth-card`, a dead `startTransition`, an unused comparator
   arg, and a **dead `safeRedirect` in `actions/auth.ts`** — the documented
   "action-layer guard" never ran; the page-level twin is the real guard, and
   the docs now say so). All fixed; lint exits with zero warnings.
7. **R9 — make the coverage claim measurable**: `@vitest/coverage-v8` with a
   100% statements/branches/functions/lines threshold on `src/lib/domain/**`.
   The first run **failed** — the "100% by convention" claim was false:
   zero-slot dial guards, `serializeJsonArray`, the malformed-clock and
   unknown-currency branches were all uncovered. All pinned with worked-example
   tests (one of my own expectations was wrong on first red — `durationMinutes('9','01:00')`
   is 960, not 60: a bare hour reads as HH:00). Gate now green at 100/100/100/100.
8. **R8 — hosted CI**: `.github/workflows/ci.yml` runs on every push/PR to
   main: `bun install --frozen-lockfile` → `prisma generate` → lint →
   typecheck → coverage-gated tests → `db:push` + seed on a throwaway
   `db/ci.db` → production build. The SSH-wrapper operator contract is now
   enforced by the host, not just the operator.

## Verification ledger

- **Reset loop, browser-verified end-to-end**: request reset → generic toast +
  link in the operator log → open `/login?token=…` → new-password card renders
  (desktop and 390px) → update → success toast, token stripped from the URL →
  **sign in with the new password works** → **old password rejected**
  ("Invalid email or password") → **token reuse rejected** ("This reset link
  is invalid or has expired").
- **Golden path re-verified after every phase** (dep pruned, strict mode on,
  dead code gone): sign in → book (toast + "Booked ✓") → cancel (toast) →
  re-book (toast + badge, same row re-activated).
- Gates: ESLint clean (zero warnings under the new rules), `tsc --noEmit`
  clean, **48/48 tests** (36 domain + 12 reset), coverage gate
  100/100/100/100 on `src/lib/domain/**`, production build green — 15 routes
  including `/robots.txt` and `/sitemap.xml`.
- Infra verified live: all five security headers present on responses;
  `/robots.txt` and `/sitemap.xml` render from `SITE_URL`; `/api` returns the
  DB-free health payload; zero horizontal overflow at 1440px and 390px on
  every route including the new auth screens.
- Screenshots refreshed in `docs/screenshots/` (now including the
  new-password card); AGENTS.md, CLAUDE.md, README.md, and the PAD realigned
  (§6 security, §7 testing/coverage, §8 CI, §10 closes four open items and
  adds six session-8 fix rows, §11 key files).
- Sandbox↔repo sync refreshed (src/, tests/, configs identical).

## Deviation note (unchanged from session 6)

The accepted deviations stand: forceSolid header on legal/404 pages (the
source's transparent white-on-cream wordmark is invisible — platform bug we
fix), original legal copy, account entry points in the menu/footer, seeded
data where the live collections are empty, and the branded login screen. The
reset loop is a new functional addition in the same category: the source's
Base44 auth backs a flow the live site never exercises; the clone makes it
real and complete.
