import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { AuraButton } from '@/components/site/aura-button'
import { db } from '@/lib/db'
import { parseJsonArray, formatMoney } from '@/lib/domain/booking-rules'

export const metadata: Metadata = {
  title: 'Pricing & Memberships',
  description:
    'This is not an expense. This is the most valuable investment you\u2019ll make in yourself.',
}

const CLASS_PACKS = [
  { priceCents: 2800, label: '1 Class', name: 'Drop-In' },
  { priceCents: 12000, label: '5 Classes', name: '5-Pack' },
  { priceCents: 21000, label: '10 Classes', name: '10-Pack' },
  { priceCents: 38000, label: '20 Classes', name: '20-Pack' },
] as const

const POLICIES = [
  {
    title: 'Billing',
    body: 'Memberships are billed on the 1st of each month. We accept all major credit cards and digital payment methods.',
  },
  {
    title: 'Cancellation',
    body: "Cancel anytime with 30 days' notice. No penalties. No questions asked. We believe in freedom of choice.",
  },
  {
    title: 'Freeze Policy',
    body: 'Need a break? Freeze your membership for up to 60 days per year at no cost. Life happens — we get it.',
  },
  {
    title: 'Refund Policy',
    body: 'Unused class packs are non-refundable but never expire. Membership refunds are prorated to the day of cancellation.',
  },
] as const

export default async function PricingPage() {
  const memberships = await db.membership.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="solid" />
      <main className="flex-1 px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="kicker text-primary/60">The investment suite</p>
          <h1 className="font-heading mt-4 text-5xl font-extralight italic tracking-tight text-primary md:text-7xl">
            Pricing &amp; memberships
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            This is not an expense. This is the most valuable investment you&apos;ll make in
            yourself.
          </p>

          {/* First-timer special */}
          <section
            aria-labelledby="first-timer"
            className="mt-16 rounded-2xl px-8 py-14 text-center md:py-20"
            style={{ background: 'linear-gradient(to top, #FFFAA4, #F6BF8E)' }}
          >
            <p className="kicker text-primary/70">First-timer special</p>
            <h2
              id="first-timer"
              className="font-heading mt-4 text-5xl font-extralight italic tracking-tight text-primary md:text-6xl"
            >
              7 days free
            </h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-primary/80">
              No commitment. No card on file. Just you and an entire week of unlimited classes to
              discover your path.
            </p>
            <div className="mt-8 flex justify-center">
              <AuraButton href="/login" variant="dark">
                Start free week
              </AuraButton>
            </div>
          </section>

          {/* Membership plans */}
          <section aria-labelledby="plans" className="mt-20">
            <p className="kicker text-primary/60">Membership plans</p>
            <h2
              id="plans"
              className="font-heading mt-4 text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
            >
              Choose your commitment
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {memberships.map((m) => {
                const features = parseJsonArray(m.features)
                return (
                  <article
                    key={m.id}
                    className={`flex flex-col rounded-xl border bg-background p-8 ${
                      m.isFeatured
                        ? 'border-primary shadow-md ring-1 ring-primary/20'
                        : 'border-border'
                    }`}
                  >
                    {m.isFeatured && (
                      <span className="mb-4 self-start bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                        Most loved
                      </span>
                    )}
                    <h3 className="font-heading text-3xl font-light text-primary">{m.name}</h3>
                    <p className="mt-4">
                      <span className="font-heading text-5xl font-extralight text-primary">
                        {formatMoney(m.priceCents)}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        /{m.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                      </span>
                    </p>
                    {m.classesPerMonth !== null && (
                      <p className="mt-2 text-xs uppercase tracking-[0.15em] text-primary/60">
                        {m.classesPerMonth} classes per month
                      </p>
                    )}
                    <ul className="mt-6 flex-1 space-y-3">
                      {features.map((f) => (
                        <li key={f} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                          <span aria-hidden="true" className="mt-2 h-1 w-4 shrink-0 bg-primary/50" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <AuraButton
                      href="/login"
                      variant={m.isFeatured ? 'dark' : 'outline'}
                      className="mt-8 self-stretch"
                    >
                      Choose {m.name}
                    </AuraButton>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Class packages */}
          <section aria-labelledby="packs" className="mt-20">
            <p className="kicker text-primary/60">Class packages</p>
            <h2
              id="packs"
              className="font-heading mt-4 text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
            >
              Pay per session
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {CLASS_PACKS.map((p) => (
                <article
                  key={p.name}
                  className="rounded-xl border border-border bg-secondary/40 p-6 text-center md:p-8"
                >
                  <p className="font-heading text-4xl font-extralight text-primary md:text-5xl">
                    {formatMoney(p.priceCents)}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                    {p.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.name}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Policies */}
          <section aria-labelledby="policies" className="mt-20">
            <p className="kicker text-primary/60">Fine print</p>
            <h2
              id="policies"
              className="font-heading mt-4 text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
            >
              Policies
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {POLICIES.map((p) => (
                <article key={p.title} className="rounded-xl border border-border p-8">
                  <h3 className="font-heading text-2xl font-light text-primary">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
