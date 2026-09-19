import Image from 'next/image'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { AuraButton } from '@/components/site/aura-button'
import { DisciplinesSection } from '@/components/site/disciplines-section'
import { BenefitsCarousel } from '@/components/site/benefits-carousel'
import { CoachesSection } from '@/components/site/coaches-section'
import { GallerySection } from '@/components/site/gallery-section'
import { db } from '@/lib/db'

const TESTIMONIALS = [
  {
    quote:
      'Sovereign didn\u2019t just change my body — it rewired my entire relationship with strength. I walk taller now.',
    name: 'Jordan K.',
    result: 'Lost 30 lbs in 4 months',
  },
  {
    quote:
      'The coaches here see something in you before you see it yourself. That\u2019s the magic of this place.',
    name: 'Priya M.',
    result: 'Completed first marathon',
  },
  {
    quote:
      'After years of pain, the Pilates program gave me my mobility back. I\u2019m stronger at 45 than I was at 25.',
    name: 'Lena R.',
    result: 'Overcame chronic back pain',
  },
] as const

export default async function HomePage() {
  const [instructorCount, classCount] = await Promise.all([
    db.instructor.count(),
    db.studioClass.count(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section aria-label="Hero" className="relative min-h-svh overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero.jpg"
              alt="Woman in powerful fitness pose"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[55%_center] md:object-center lg:object-[90%_center]"
            />
            {/* espresso gradient — the signature AURA hero wash */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-svh flex-col justify-between px-6 pb-14 pt-32 md:px-10 md:pb-20">
            <h1 className="sr-only">AURA Studio — Strength Redefined</h1>
            <div className="md:flex md:justify-between md:pt-16">
              <p
                aria-hidden="true"
                className="font-heading max-w-xs text-5xl font-extralight italic leading-[1.05] tracking-tight text-primary-foreground md:text-7xl lg:text-8xl"
              >
                Strength
              </p>
            </div>
            <div className="md:flex md:items-end md:justify-between md:gap-16">
              <p className="mt-8 max-w-md text-sm leading-relaxed text-primary-foreground/85 md:mt-0 md:text-base">
                A sanctuary for women who choose to be extraordinary. Where every rep is a
                revolution and every class is a declaration.
              </p>
              <div className="mt-8 flex flex-col items-start gap-8 md:mt-0 md:items-end">
                <p
                  aria-hidden="true"
                  className="font-heading text-right text-5xl font-extralight italic leading-[1.05] tracking-tight text-primary-foreground md:text-7xl lg:text-8xl"
                >
                  Redefined
                </p>
                <AuraButton href="/classes" variant="light">
                  Secure your space
                </AuraButton>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FIRST WEEK FREE ============ */}
        <section
          aria-labelledby="free-week"
          className="px-6 py-20 md:px-10 md:py-28"
          style={{
            background: 'linear-gradient(to top, #FFFAA4, #F6BF8E)',
          }}
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <h2
                id="free-week"
                className="font-heading text-5xl font-extralight italic tracking-tight text-primary md:text-6xl"
              >
                Your first week free
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-primary/80 md:text-base">
                Experience every class, meet every instructor, and feel the energy of AURA before
                making your commitment. No strings, no pressure, just pure discovery.
              </p>
            </div>
            <div className="flex md:justify-end">
              <AuraButton href="/login" variant="dark">
                Claim your week
              </AuraButton>
            </div>
          </div>
        </section>

        {/* ============ THE DISCIPLINES ============ */}
        <DisciplinesSection />

        {/* ============ SKY BANNER (Inhale / Exhale) ============ */}
        <section aria-label="Inhale, exhale" className="relative h-[70vh] min-h-[480px] overflow-hidden">
          <Image
            src="/images/sky.jpg"
            alt="Sky"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/20" />
          <div className="relative z-10 flex h-full items-center justify-between px-6 md:px-16">
            <div className="text-center">
              <p className="kicker text-primary-foreground/90">Move beautifully. Live powerfully.</p>
              <h2 className="font-heading mt-4 text-5xl font-extralight italic tracking-tight text-primary-foreground md:text-7xl">
                Inhale
              </h2>
            </div>
            <h2 className="font-heading hidden text-5xl font-extralight italic tracking-tight text-primary-foreground md:block md:text-7xl">
              Exhale
            </h2>
          </div>
        </section>

        {/* ============ WHY AURA ============ */}
        <BenefitsCarousel />

        {/* ============ COACHES ============ */}
        <CoachesSection instructorCount={instructorCount} />

        {/* ============ TESTIMONIALS ============ */}
        <section
          aria-labelledby="proof"
          className="bg-secondary/50 px-6 py-20 md:px-10 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="kicker text-primary/60">Proof of power</p>
            <h2
              id="proof"
              className="font-heading mt-4 max-w-xl text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
            >
              Their words, their results
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <figure
                  key={t.name}
                  className="flex h-full flex-col justify-between bg-background p-8 shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="font-heading text-4xl font-extralight text-primary/25"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <blockquote className="mt-6 flex-1">
                    <p className="font-heading text-lg font-light italic leading-relaxed text-primary">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </blockquote>
                  <figcaption className="mt-8 border-t border-border pt-4">
                    <p className="text-sm font-medium text-primary">{t.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {t.result}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ============ GALLERY ============ */}
        <GallerySection />

        {/* ============ FINAL CTA ============ */}
        <section className="bg-primary px-6 py-20 text-center md:px-10 md:py-28">
          <h2 className="font-heading mx-auto max-w-2xl text-4xl font-extralight italic tracking-tight text-primary-foreground md:text-6xl">
            {classCount} classes a week. One decision.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/70">
            The hardest part of any transformation is the first session. We&apos;ve made the rest
            easy.
          </p>
          <div className="mt-10 flex justify-center">
            <AuraButton href="/classes" variant="light">
              Book your first class
            </AuraButton>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
