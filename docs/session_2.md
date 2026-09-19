# Session 2 — Parity Remediation Log

Continuation of `docs/session_1.md`. Goal: re-login to the live app, verify
every surface against the source with computed styles (not screenshots), and
remediate the gaps found — then push to `main`.

## Recon findings (computed styles, agent-browser + VLM)

- Logged in with the operator credentials — the live app redirects to `/`;
  it has **no dashboard, /account, /profile, /bookings or /admin routes**
  (all 404 — verified by direct probing). The referenced
  `docs/fitness-studio-new-dashboard.png` does not exist in the repo (raw
  URL 404s), so the live site itself remained the source of truth.
- Header: fixed, h-16, **centered Taviraj wordmark** (breathe 7.2s) + right
  custom 3-line burger; transparent/white over the hero, swaps to cream and
  slides out (translateY(-100%)) past ~64px of scroll; menu = cream dropdown
  panel with Taviraj 28px links + "Book a class" + studio hours.
- All inner pages (classes, pricing, instructors) open with an **espresso
  hero band** (`bg-primary pt-36/44 pb-20/28`).
- Home sections measured: hero (Strength top-left / Redefined absolute
  bottom-right, non-italic, per-letter reveal), free-week (centered, wheat
  SVG, blurred butter/peach glow, → /pricing), **disciplines dial** (sticky
  circular scrollspy selector + 4 stacked image cards, Book → /classes?type=X),
  sky banner (black/50 overlay, infinity SVG with orbiting dot, bottom kicker
  bar), benefits **coverflow** (±340/680/1020px, scale .92/.84/.76), coaches
  **accordion** (351px → 791px spring, gradient panels, row-reverse
  alternates), testimonials (small 01 numbers, sentence-case results),
  gallery **collage** (mask fades, mouse parallax, lightbox), footer
  (**photo backdrop + layered glowing SVG wordmark — no marquee**).
- Legal pages live at `/privacy`, `/terms`, `/accessibility` (not `/legal/*`);
  the login page is the Base44 platform default (slate); the 404 is branded.
- CTA targets: Claim Your Week → /pricing, Start Free Week → /classes.

## Remediation executed (TDD where logic is pure)

1. Design system: `AuraButton` re-measured (rounded, 12px, tracking
   0.1em→0.2em, arrow-up-right); headings to Taviraj font-light non-italic;
   kicker 0.3em; `.container-aura` (max-w-1400/8vw gutters); exact breathe
   keyframes; `.coach-panel` gradient; `.animate-gradientShift`.
2. Header rebuilt (fixed + hide-on-scroll, cream menu, hours; espresso chrome
   while open — fixes the source's invisible white-on-cream wordmark).
3. Home rebuilt: hero, free-week glow + wheat SVG, **discipline dial**
   (pure math in `lib/domain/discipline-wheel.ts`, red-green tested), sky
   infinity, coverflow benefits, coaches accordion, testimonials restyle,
   gallery collage + lightbox, extra trailing CTA removed.
4. Pages: espresso bands on classes/pricing/instructors/account; pricing
   rebuilt as five bands (packs over a photo backdrop); filter rails became
   rounded pills; empty state matches source copy; branded `not-found.tsx`;
   legal routes moved to /privacy /terms /accessibility with /legal/*
   permanent redirects; login gains the Google button + OR divider (inert,
   honest toast).
5. Engineering: `test` script added to package.json; `vitest.config.ts`
   scopes the suite to `tests/`; sync script hardened (never leaks sandbox
   runtime scripts, carries vitest config).

## Verification ledger

- ESLint clean; **24/24** vitest tests (21 prior + 3 dial-rotation).
- Routes: / /classes (+?type=Yoga) /pricing /instructors /login /privacy
  /terms /accessibility → 200; unknown → branded 404; /legal/* → 308 → new paths.
- Browser E2E golden path re-run: sign-up (Taylor) → book Sunrise Flow
  (spots 7→6, "BOOKED ✓") → cancel from /account (spots restored 7).
- Interactions: menu open/close, header hide/show at 64px, dial click
  scrolls to card (cardTop 112px vs source 114px) and rotates -540°≡-180°,
  accordion expands to 807px, lightbox prev/next/close.
- VLM passes: home 9/9 sections, classes, pricing, mobile 390px (no
  horizontal overflow).
- Docs realigned: AGENTS.md, CLAUDE.md, README.md, PAD (design system,
  routes, file map, known issues, test counts).
