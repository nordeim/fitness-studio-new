# Session 4 — Parity Deep-Pass + Booking Engine Fixes

Continuation of `docs/session_3.md`. Goal: re-verify every surface against
the live app with fresh eyes, close the remaining parity gaps, and fix the
production bugs the deeper pass exposed — then push to `main`.

## Recon findings (fresh login, computed styles + VLM)

- Re-logged in with the operator credentials. Re-confirmed by direct
  navigation: the live app has **no dashboard/account/admin/profile/bookings
  routes** — every candidate renders the branded 404 even when authenticated
  (curl 200s are meaningless on the SPA; the client router renders 404).
  The dashboard image referenced in the prompt still 404s on GitHub. The
  public site remains the parity target.
- Section sweep (computed `background-image` per section) surfaced what the
  session-2 screenshot pass had smoothed over:
  - **Testimonials (PROOF OF POWER)**: photo backdrop + `bg-black/20`
    overlay, **white** kicker/h2, and a **rotating spotlight** of three
    260px flip-cards — 15s of 500ms opacity sampling decoded the engine:
    ~3s slots (9s cycle), exactly one card's quote face lit at a time while
    the other two dissolve to giant Taviraj-200 cream numbers over the
    photo; both layers crossfade 1200ms ease-in-out. Real-cursor hover
    **freezes** the rotation on the hovered card (only its quote visible,
    active index notwithstanding). The clone had static white cards with
    small "01/02/03" numbers — a full rebuild.
  - **Disciplines**: the source has a right-aligned **ALL CLASSES** dark
    button under the card stack (measured x=1164, 115px off the right
    gutter at 1440px) — missing in the clone.
  - **404**: the source renders the hosting platform's slate NotFound
    inside AURA chrome — `slate-50` field, `slate-300` digits, "Page Not
    Found", `The page "path" could not be found in this application.`
    (quoted path!), white Go Home button with home icon. The clone had an
    AURA-styled screen. Also: the source's header sits transparent+white
    over the light field there — an invisible wordmark (source bug).
  - Footer copyright: source says "Built on Base44." not "All rights
    reserved."
  - Sky banner DOM order (reading order parity), clone-only sr-only
    "3 additional coaches" text, testimonial quotes use straight ASCII
    quotes on the source.
- Verified unchanged/matching: benefits gradient (cream→butter), gallery
  gradient, pricing packs photo (byte-compared the source image — 0.23 MAD),
  CTA targets, VIEW ALL button spec, instructors espresso band (no kicker,
  h1 "Our instructors").

## Remediation executed (TDD at every pure seam)

1. **Testimonial spotlight** — new `testimonials-section.tsx` (client) on a
   pure engine `lib/domain/testimonial-spotlight.ts`:
   `quoteFaceVisible` (pre-reveal all-quotes / rotation / hover-freeze
   truth table) + `nextActive` (forward wrap). Red→green: 4 tests.
   Reveal arms via IntersectionObserver; `prefers-reduced-motion` keeps the
   static all-quotes band; number spans `aria-hidden`; focus mirrors hover.
2. **ALL CLASSES** button added under the discipline card stack
   (right-aligned, dark AuraButton, → /classes).
3. **404 rebuilt** to the source's slate platform screen: new pure
   `formatNotFoundCopy` (red→green: 2 tests) + client `not-found-message`
   (usePathname) + `forceSolid` header prop (fixes the invisible wordmark;
   hide-on-scroll retained).
4. Footer copyright, sky-banner DOM order, sr-only text removal.
5. **BUG (found by the golden-path smoke): re-booking after cancellation
   crashed with Prisma P2002.** A cancelled row occupies
   `@@unique([userId, classId])` forever, so the second `create` throws.
   Fixed with `planBookingWrite` in `lib/domain/booking-rules.ts`
   (red→green: 5 tests, replacing the `checkBooking` cases) — the plan
   returns `reactivate` for a cancelled prior row and the action updates
   the row (status + bookingDate) inside the same transaction; deny
   DUPLICATE / deny CAPACITY_FULL semantics preserved; re-activation still
   denied when the class has since filled.
6. **BUG: no toast ever rendered.** The root layout mounted the shadcn
   `ui/toaster` (Radix, wired to an unused `useToast`) while every site
   component calls sonner's `toast` — two disjoint systems, zero user
   feedback on booking/cancel/auth. Fixed: the layout mounts sonner's
   `<Toaster position="bottom-right" />`.

## Verification ledger

- ESLint clean; **32/32** vitest tests (24 prior + spotlight 4 + 404 copy 2
  + write-plan rework nets +2); production build green (all routes).
- Spotlight engine observed in-browser: rotation samples match the source
  cadence (3s slots, 9s cycle, 1.2s crossfades); real-cursor hover freezes
  on the hovered card with cream bg + quote while the others hold their
  number faces (transparent + cream hairline).
- ALL CLASSES lands at x=1164 / 115px off the right gutter — the source's
  exact geometry. 404: slate field + quoted path + Go Home; header renders
  cream+espresso at the top of the page.
- Golden path re-run end-to-end: book (toast "You're booked. See you on
  the floor.", spots 9→10, BOOKED ✓) → cancel from /account (toast, spots
  restored) → **re-book the same class** (row re-activated, spots 9→10
  again) — the previously-crashing path now works.
- VLM passes: home full-page audit (9 sections, PASS), testimonials band
  vs source (style match), 404, mobile 390px home/classes/404 (no
  horizontal overflow; the "1 Issue" badge in the audit is the Next.js
  dev-tools overlay, not site chrome).
- Docs realigned: AGENTS.md, CLAUDE.md, README.md, PAD (§5 design
  reference, §7 testing, §10 known issues incl. the two fixed bugs and the
  kept deviations, §11 key files).
