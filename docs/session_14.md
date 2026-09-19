# Session 14 — Hardening the Auth Surface: Rate Limits + Timing Equalization

Continuation of `docs/session_12.md` / `docs/session_13.md`. Goal: refresh
the workspace (the owner had pushed `session_13.md` and an updated
`start_server_log.txt`), re-validate every documented claim against the
codebase, re-verify the live source and the owner's deployment, then close
the remaining enterprise-grade gaps — the headline being that **the auth
surface had no brute-force protection at all**.

## Recon findings (everything else is healthy)

- **The owner's deployment is fully functional.** The new
  `start_server_log.txt` documents their post-session-12 redeploy following
  the checklist exactly: `rm db/custom.db` → `db:migrate` (init migration
  applied) → `scripts/seed.ts` (27 classes) → `rm -rf .next && bun run build`
  (15 routes) → `bun run start` (Ready). Live checks confirm every route
  200 — `/classes` renders the seeded schedule, `/instructors` the four
  coaches, `/pricing` the memberships (the static pages baked with data
  because the rebuild happened *after* seeding this time). The session-12
  standalone fix is proven in production.
- **The live source (`fitness-studio.base44.app`) is unchanged** — the
  ninth consecutive session to find it so. Operator login succeeds and
  redirects to `/`; `/dashboard` renders the platform 404; the referenced
  dashboard PNG remains absent from the repo and GitHub raw (404). The
  authenticated menu equals the public one. The parity target stays the
  public site plus the authenticated booking flows.
- **Baseline gates on the fresh tree:** lint clean, typecheck clean,
  59/59 tests, coverage 100×4, working tree clean at `2cc9dc0`.
- **An apparent DB-write anomaly investigated and dismissed:** session-14
  test sign-ups initially landed in `/home/z/my-project/db/custom.db`
  (a workspace scaffold path) instead of the repo DB. Root cause: a dev
  server left running from the *previous* session carried an injected
  absolute `DATABASE_URL=file:/home/z/my-project/db/custom.db` — absolute
  URLs pass through `resolveDatabaseUrl` untouched **by design** (the
  CI/container escape hatch). Not a code bug; the stale server was killed
  and the golden path re-verified against the repo DB with a clean
  environment. (A later scare — "missing" users in every DB — traced to
  the browser automation itself: snapshotting `/classes` for the SIGN OUT
  button, which lives on `/account`, left the session authenticated, and
  `/login`'s authenticated redirect masked subsequent sign-up commands as
  no-ops. fd-level inspection confirmed the standalone server had the
  repo DB open throughout.)

## The gaps (found by security review, validated against the code)

1. **No rate limiting on any auth mutation.** `signInAction` allowed
   unbounded password brute force; `signUpAction` allowed account spam;
   `requestPasswordResetAction` allowed token/mail flooding (each request
   mints a `PasswordResetToken` row); `resetPasswordAction` allowed token
   brute force. Nothing in the codebase throttled anything — the
   `RATE_LIMITED` error code existed in the `ActionResult` union since
   session 8 but no action could ever return it.
2. **Sign-in timing oracle.** `user ? verifyPassword(...) : false` skipped
   the scrypt work when the account was absent, so response latency
   revealed which emails have accounts — an oracle the uniform error copy
   was specifically designed to hide.

## Remediation (TDD)

- **RED first:** `tests/rate-limit.test.ts` — 13 worked examples for the
  pure policy: first-ever attempt starts a window at count 1; under-limit
  attempts count up; the limit-boundary attempt is denied with state
  frozen (a lockout always ends within one window — denied attempts never
  extend it); the exact window boundary rolls over to a fresh window;
  a limit-1 policy denies the immediate second attempt; `formatRetryAfter`
  rounds partial seconds/minutes UP (never promises less than the real
  wait), pluralizes, and clamps non-positive input. The red run also
  caught the repo's test convention (relative `../src` imports — vitest
  has no `@/` alias).
- **GREEN:** `src/lib/domain/rate-limit.ts` (pure, import-free, 100%
  covered) — `evaluateRateLimit` + `formatRetryAfter`.
- **The counters (I/O):** `src/lib/rate-limit-store.ts` — a module-level
  Map (HMR-safe via `globalThis`, same pattern as the Prisma client),
  `consumeRateLimit` (atomic check-and-count), `clientIpFromHeaderList`
  (`x-forwarded-for` first hop → `x-real-ip` → `'unknown'`), opportunistic
  pruning past 10k entries, and `AUTH_RATE_LIMITS` — signIn 10/15 min per
  IP **and** per email, signUp 5/h per IP, reset request 5/h per IP and
  3/h per email, reset consumption 10/h per IP. Product decisions, not
  env knobs. Single-instance by design (the documented SQLite topology);
  the docs state plainly: move the counters to a shared store before
  adding replicas.
- **Wiring:** all four auth actions check their limits *after* Zod parse
  (malformed input never consumes budget) and *before* any DB work;
  denials return `RATE_LIMITED` with the customer-safe wait copy. The
  client needed zero changes — it toasts `error.message` generically.
- **Timing equalization:** `DUMMY_PASSWORD_HASH` — a valid-format scrypt
  hash of a throwaway password with identical N/r/p/keylen — exported from
  `lib/auth/passwords.ts`; `signInAction` now always runs exactly one
  scrypt verification (real hash or dummy), making absent-account responses
  cost the same as real ones.

## Verification ledger

- **Gates:** lint clean, typecheck clean, **72/72 tests** (59 + 13 new),
  100% coverage ×4 on `src/lib/domain/**` (including `rate-limit.ts`),
  clean-tree production build (15 routes).
- **Dev runtime:** correct sign-in; wrong password → uniform copy;
  nonexistent email → identical copy (dummy-hash path); **burn test** —
  the limiter fired with "Too many sign-in attempts. Try again in 14
  minutes." and the lockout held even for the *correct* password; full
  reset loop (request → operator-log token → new password → old rejected
  → new signs in); booking sweep (book → cancel → re-book, single
  re-activated `confirmed` row); fresh sign-up.
- **Standalone production runtime** (`rm -rf .next && bun run build &&
  env -u DATABASE_URL bun run start`): all routes 200/404 as designed;
  real golden path — sign-up → `/account`, book BARRE → BOOKED ✓, cancel,
  re-book → single re-activated `confirmed` row in `<repo>/db/custom.db`;
  **production burn test** — attempts 1–10 answered with the uniform
  error, **attempt 11 denied** with "Try again in 15 minutes." Exactly
  the policy, on the exact runtime the owner deploys.

## Documentation realignment

AGENTS.md (72 tests; the rate-limiting + timing-equalization invariant;
test-file list), CLAUDE.md (auth section, error-code note, test table,
command table), README.md (features: rate-limited auth + 72-test row;
file hierarchy; verify-setup and testing sections), PAD (§3.2 directory
tree incl. the session-12/14 modules; §6.3 rate limiting + timing
equalization; §6.4 threat model rows; §7 test distribution/patterns/
checklist; §10 two resolved rows; §11 key files), this session log, and
the refreshed `docs/screenshots/` set.

## Deviation note (unchanged)

The accepted deviations stand: forceSolid header on legal/404 pages, the
clone's account entry points, seeded data where the live collections are
empty, original legal copy, the branded login screen, and the operator's
committed `.env`. The live app remains unchanged, so parity needed no
visual work this session; the delta was auth-surface hardening.
