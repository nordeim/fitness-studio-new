# Session 6 — Fresh-Eyes Parity Audit: Overflow, Legal Layout, Hidden Focus

Continuation of `docs/session_4.md` / `docs/session_5.md`. Goal: refresh the
workspace (`git pull` picked up `session_5.md`), re-validate the docs against
the codebase, re-login to the live app, and sweep every surface with fresh
eyes — then fix what the sweep exposed, capture a screenshot set, realign the
docs, and push to `main`.

## Recon findings (fresh login, DOM-measured)

- Re-confirmed with the operator credentials: the live app still has **no
  dashboard/account/admin routes** (login redirects to `/`), and the
  referenced dashboard PNG still 404s on GitHub — the public site plus the
  authenticated booking flow remains the parity target.
- Page-by-page `innerText` diff of live vs clone (all 9 routes captured on
  both): home, classes, pricing, instructors, login, and footer match 1:1
  modulo the documented functional additions (menu/footer account links) and
  the documented data divergences (the live's Classes/Pricing/Instructor
  collections are empty; the clone seeds real data).
- **Legal pages** — the live renders cream prose pages, not espresso bands:
  `min-h-screen bg-background pt-24 pb-16`, a `max-w-3xl mx-auto px-6
  md:px-[8vw]` column, h1 `text-4xl md:text-5xl font-light mb-12` (measured
  48px/48px at 1440), `space-y-10` sections of h2 `text-2xl font-light mb-4`
  (24px/32px) + 16px/26px body at `text-primary/80`, "A legal disclaimer" is
  the first H2 *section*, Title-Case titles, header transparent+white (the
  same invisible-wordmark platform bug as the 404). The clone had invented an
  espresso band + kicker + 5xl/7xl h1.
- **404 copy** — the live quotes the offending path **without its leading
  slash** (`The page "does-not-exist"…`, verified for `/does-not-exist` and
  `/foo/bar`); the clone kept the slash. The live's slate field is
  `min-h-screen` with the content centered at the viewport midpoint and the
  footer below the fold; the clone's field was squeezed between header and
  footer (`flex-1`), leaving the 404 high with dead space.
- **Header menu a11y** — the live mounts its menu links only while open; the
  clone's closed panel was `aria-hidden` with links still `tabIndex=0` —
  Tab landed on invisible links at y=-8 (WCAG 2.4.3 / aria-hidden-focus).
- **Benefits coverflow** — the live's controls sit **below** the stage
  (`gap-12` down): a desktop-only `justify-between` row of round `w-10/h-10
  md:w-11/h-11` prev/next buttons carrying a custom long-arrow glyph
  (hairline + open arrowhead, 1px non-scaling stroke, previous rotated 180°)
  flanking a **passive dot rail** (active 10px `#411401` fill, inactive 8px
  espresso border; the dots are divs and do not respond to clicks — verified).
  The stage is `h-96` (384px). Mobile stacks all six cards (`px-6 py-8`,
  `gap-6`) with no controls. The clone had flanking chevrons, no desktop
  dots, and a single-card mobile carousel.
- **Coaches** — the live renders **rows of two** (`justify-between`, 28px
  gap, `mb-8` between rows; expanded 791–807 + collapsed 351 = 1170px), and
  **each row is an independent accordion**: clicking Aria swaps only row 1;
  row 2 keeps its own active card. Default state is the diagonal composition
  (Keyla + Jordan expanded). The clone rendered one non-wrapping row —
  buttons 3–4 overflowed to x≈2079, producing a horizontal scrollbar at
  1440px (the page's `scrollWidth` was 2079 vs the source's 1440 — why every
  prior full-page comparison screenshot looked 44% wider than the source).
- **Footer copyright row** — the live: `mt-16` above a
  `border-t border-[#F0EFE9]/90` hairline, `pt-8`, links stack on mobile,
  full-opacity `text-xs`; the clone had `pt-6`, `border-white/10`, row-wide
  `opacity-70`, no stacking.
- Verified matching (no action): hero DOM/geometry (the "missing headline"
  VLM flag was a full-page-capture artifact — the capture mechanism replays
  the one-shot char-rise animation; a viewport screenshot proves the
  headline renders at full opacity), dial label positions, coverflow slot
  math and side-card opacities (`[1,1,1,0,1,1]` — identical), testimonial
  spotlight engine, gallery, pricing bands, instructors, coaches card
  internals, login card (documented branded deviation).

## Remediation executed

1. **G1 — 404 copy** (TDD): red tests first (`formatNotFoundCopy` must strip
   the leading slash; added the `/` → `""` edge case), then the one-line fix
   in `lib/domain/not-found.ts`. 32/32 green.
2. **G2 — Legal pages rebuilt** to the measured spec: `LegalPage` is now the
   cream prose page (Title-Case titles "Privacy Policy" / "Terms &
   Conditions" / "Accessibility Statement", `forceSolid` header); the three
   page files updated (incl. an "effective date on this page" copy fix).
3. **G3 — Menu `inert`**: the closed panel is `inert={!open}` — Tab now
   skips it entirely (verified: focus lands on visible footer content), and
   the open menu remains fully keyboard-navigable.
4. **G4 — Footer copyright row** re-measured: hairline `#F0EFE9/90`, `mt-16
   pt-8`, stacked-on-mobile legal links, full opacity.
5. **G5 — 404 field**: `min-h-screen` centered field; content sits at the
   exact viewport midpoint (cardCenter 450 at 900px) like the source.
6. **G6 — Benefits controls rebuilt**: h-96 stage, below-stage controls row
   (long-arrow buttons + passive dot rail, desktop only), mobile = six
   stacked cards. Click-through verified (next → "02 Expert-Led Classes",
   dot index follows).
7. **G7 — Coaches rows-of-two** (the overflow fix): `CoachRow` sub-component
   — each row an independent accordion, default active alternating
   first/last (the source's diagonal), second-slot cards open mirror-image.
   `scrollWidth` is back to 1440; per-row independence verified by click.

## Verification ledger

- ESLint clean; **32/32** vitest tests; production build green (13 routes);
  dev-server golden path re-run end-to-end with a fresh account
  (sign-up → book Sunrise Flow → toast + "BOOKED ✓" → cancel from /account
  → toast → **re-book the same class** → same row re-activated, toast +
  badge) — the session-4 booking fixes still hold.
- DOM-verified: legal h1 48px/mb-48px & prose `text-primary/80`; 404 copy
  without slash and cardCenter=viewport/2; menu inert (Tab skips closed
  menu, enters open menu); benefits stage 384px, controls 48px below, dots
  10/8px, arrow viewBox `0 0 52.01 27.9`; coaches [807/351] + [351/807] at
  x=135/970 and x=135/514; footer hairline `lab(94.4 … / 0.9)`.
- VLM full-page comparisons (both pages captured at a forced 1440@1x
  viewport, scroll-through for lazy images, CSS one-shot reveals frozen at
  final state): **home PARITY: PASS** (all nine sections), **404 PARITY:
  PASS**, legal page structurally matched (remaining flags are the
  documented deviations: forceSolid header, original legal copy).
- Mobile 390px: zero horizontal overflow on /, /classes, /pricing,
  /instructors, /privacy, /404; VLM mobile audit PASS (stacked benefits,
  stacked coaches, touch targets ≥44px).
- Screenshots: 9 dev-server captures saved to `docs/screenshots/` (home,
  classes, pricing, instructors, login, authenticated account, 404, privacy,
  mobile home) with a README.
- Docs realigned: AGENTS.md (legal-layout exception, inert menu, benefits
  controls, coaches rows, footer row, 404 spec), CLAUDE.md (design-system
  bullets), README.md (features, hierarchy, verify-setup), PAD (§5.3 five
  re-measured primitives, §10 five session-6 fix rows).
