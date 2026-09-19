# Screenshots — AURA Studio clone (dev server)

Captured from `bun run dev` (Next.js 16.3, Turbopack) at 1440×900 desktop
(and 390×844 mobile) after the session-12 standalone-deployment fix
(app-side SQLite URL resolution — `lib/domain/database-url.ts` — plus the
sharp 0.35.4 security bump; the same golden path was re-verified against
the `bun run start` standalone build). Pages were scrolled through before
full-page capture to trigger lazy images; every interactive state below is
live dev-server output.

| File | Route | What it shows |
|---|---|---|
| `home.png` | `/` | Full home: hero, free-week glow, discipline dial + cards, sky banner, benefits coverflow (below-stage arrow controls + dot rail), coaches accordion in rows of two, testimonial spotlight band, gallery collage, footer with copyright hairline |
| `classes.png` | `/classes` | The Kinetic Calendar — 27 seeded classes, TYPE/INTENSITY/DAY pill filters synced to the URL, live spots-left |
| `pricing.png` | `/pricing` | The Investment Suite — first-timer special, membership plans, class packs on photo, policies |
| `instructors.png` | `/instructors` | Espresso hero + philosophy + the four-coach roster from the database |
| `login.png` | `/login` | AURA-branded auth card (sign-in mode, Google button + OR divider) |
| `reset-password.png` | `/login?token=…` | The new-password card (fourth auth mode): password + confirm, deep-linked from a reset email / operator-log link; submitting consumes the single-use token and revokes other sessions |
| `account.png` | `/account` | Member area (authenticated): upcoming booking with cancel, sign-out |
| `not-found.png` | `/does-not-exist` | Source-matched slate 404: quoted offending path without leading slash, Go Home button, full-viewport centered field |
| `privacy.png` | `/privacy` | Legal page in the source's cream prose layout (max-w-3xl column, modest serif h1, h2 sections) |
| `home-mobile.png` | `/` @ 390px | Mobile home: stacked benefits (all six cards), stacked coaches, no horizontal overflow |

Regenerate with an agent-browser flow: scroll-through to trigger lazy
images, then `screenshot --full` (note the daemon saves relative to its own
CWD — move files into this folder afterwards).
