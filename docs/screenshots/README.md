# Screenshots — AURA Studio clone (dev server)

Captured from `bun run dev` (Next.js 16, Turbopack) at 1440×900 desktop
(and 390×844 mobile) after the session-6 remediation. CSS one-shot reveals
(hero char-rise) are frozen at their final state for full-page capture;
every interactive state below is otherwise live dev-server output.

| File | Route | What it shows |
|---|---|---|
| `home.png` | `/` | Full home: hero, free-week glow, discipline dial + cards, sky banner, benefits coverflow (below-stage arrow controls + dot rail), coaches accordion in rows of two, testimonial spotlight band, gallery collage, footer with copyright hairline |
| `classes.png` | `/classes` | The Kinetic Calendar — 27 seeded classes, TYPE/INTENSITY/DAY pill filters synced to the URL, live spots-left |
| `pricing.png` | `/pricing` | The Investment Suite — first-timer special, membership plans, class packs on photo, policies |
| `instructors.png` | `/instructors` | Espresso hero + philosophy + the four-coach roster from the database |
| `login.png` | `/login` | AURA-branded auth card (sign-in mode, Google button + OR divider) |
| `account.png` | `/account` | Member area (authenticated): upcoming booking with cancel, sign-out |
| `not-found.png` | `/does-not-exist` | Source-matched slate 404: quoted offending path without leading slash, Go Home button, full-viewport centered field |
| `privacy.png` | `/privacy` | Legal page in the source's cream prose layout (max-w-3xl column, modest serif h1, h2 sections) |
| `home-mobile.png` | `/` @ 390px | Mobile home: stacked benefits (all six cards), stacked coaches, no horizontal overflow |

Regenerate with `scripts/capture-full-page.sh`-style flows (scroll-through
to trigger lazy images, then full-page capture).
