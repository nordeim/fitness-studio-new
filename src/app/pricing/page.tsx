import type { Metadata } from 'next'
import Image from 'next/image'
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

/**
 * Pricing — mirrors the source's five-band composition: espresso hero,
 * butter-gradient first-timer band, membership plans on cream, class packs
 * over a studio photograph, and the fine-print grid.
 */
export default async function PricingPage() {
  const memberships = await db.membership.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* 1 — Espresso hero band */}
        <section className="bg-primary px-6 pb-20 pt-36 text-primary-foreground md:px-[8vw] md:pb-28 md:pt-44">
          <div className="max-w-[1400px]">
            <p className="kicker mb-4 opacity-60">The investment suite</p>
            <h1 className="font-heading text-5xl font-light leading-tight md:text-7xl">
              Pricing &amp; memberships
            </h1>
            <p className="mt-6 max-w-md font-body text-sm leading-relaxed opacity-70 md:text-base">
              This is not an expense. This is the most valuable investment you&apos;ll make in
              yourself.
            </p>
          </div>
        </section>

        {/* 2 — First-timer special: butter → cream diagonal band */}
        <section
          aria-labelledby="first-timer"
          className="px-6 py-16 text-primary md:px-[8vw] md:py-20"
          style={{ background: 'linear-gradient(135deg, #FFFAA4 0%, #F0EFE9 100%)' }}
        >
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <p className="kicker mb-3 opacity-80">First-timer special</p>
              <h2
                id="first-timer"
                className="font-heading text-2xl font-light md:text-4xl"
              >
                7 days free
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed opacity-80">
                No commitment. No card on file. Just you and an entire week of unlimited classes
                to discover your path.
              </p>
            </div>
            <AuraButton href="/classes" variant="dark" className="shrink-0">
              Start free week
            </AuraButton>
          </div>
        </section>

        {/* 3 — Membership plans (seeded — the source's collection is empty) */}
        <section aria-labelledby="plans" className="px-6 py-16 md:px-[8vw] md:py-24">
          <div className="max-w-[1400px]">
            <div className="mb-16">
              <p className="kicker mb-4 text-primary">Membership plans</p>
              <h2
                id="plans"
                className="font-heading text-3xl font-light leading-tight tracking-tight text-primary md:text-5xl"
              >
                Choose your commitment
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {memberships.map((m) => {
                const features = parseJsonArray(m.features)
                return (
                  <article
                    key={m.id}
                    className={`flex flex-col rounded-2xl border bg-background p-8 ${
                      m.isFeatured
                        ? 'border-primary shadow-[rgba(230,146,76,0.12)_0_12px_20px_4px]'
                        : 'border-border/50'
                    }`}
                  >
                    {m.isFeatured && (
                      <span className="mb-4 self-start bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                        Most loved
                      </span>
                    )}
                    <h3 className="font-heading text-3xl font-light text-primary">{m.name}</h3>
                    <p className="mt-4">
                      <span className="font-heading text-5xl font-light text-primary">
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
                        <li
                          key={f}
                          className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1 w-4 shrink-0 bg-primary/50"
                          />
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
          </div>
        </section>

        {/* 4 — Class packages over the studio photograph */}
        <section
          aria-labelledby="packs"
          className="flex flex-col justify-center px-6 py-24 text-primary-foreground md:px-[8vw] md:py-40"
        >
          <div className="relative mx-auto w-full max-w-[1400px]">
            <Image
              src="/images/packs-bg.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-top"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative">
              <div className="mb-16">
                <p className="kicker mb-4">Class packages</p>
                <h2
                  id="packs"
                  className="font-heading text-3xl font-light leading-tight tracking-tight md:text-5xl"
                >
                  Pay per session
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {CLASS_PACKS.map((p) => (
                  <article
                    key={p.name}
                    className="rounded-2xl border border-border/50 bg-background p-6 text-center text-primary md:p-8"
                  >
                    <p className="font-heading text-3xl font-light md:text-4xl">
                      {formatMoney(p.priceCents)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.15em] text-primary">
                      {p.label}
                    </p>
                    <p className="font-heading mt-1 text-lg">{p.name}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Fine print */}
        <section aria-labelledby="policies" className="px-6 py-16 md:px-[8vw] md:py-24">
          <div className="max-w-[1400px]">
            <div className="mb-16">
              <p className="kicker mb-4 text-primary">Fine print</p>
              <h2
                id="policies"
                className="font-heading text-3xl font-light leading-tight tracking-tight text-primary md:text-5xl"
              >
                Policies
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {POLICIES.map((p) => (
                <article
                  key={p.title}
                  className="rounded-2xl border border-border/50 p-8"
                >
                  <h3 className="font-heading text-2xl font-light text-primary">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
