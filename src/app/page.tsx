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
      'Sovereign didn\u2019t just change my body \u2014 it rewired my entire relationship with strength. I walk taller now.',
    name: 'Jordan K.',
    result: 'Lost 30 lbs in 4 months',
  },
  {
    quote: 'The coaches here see something in you before you see it yourself. That\u2019s the magic of this place.',
    name: 'Priya M.',
    result: 'Completed first marathon',
  },
  {
    quote: 'After years of pain, the Pilates program gave me my mobility back. I\u2019m stronger at 45 than I was at 25.',
    name: 'Lena R.',
    result: 'Overcame chronic back pain',
  },
] as const

/** Per-letter hero reveal, staggered like the source. */
function HeroWord({ word, className }: { word: string; className?: string }) {
  return (
    <span className={className} aria-label={word} role="text">
      {word.split('').map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="char-rise inline-block leading-none"
          style={{ animationDelay: `${0.06 * i}s` }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

export default async function HomePage() {
  const instructors = await db.instructor.findMany({
    orderBy: { sortOrder: 'asc' },
    take: 4,
    select: { id: true, name: true, title: true, bio: true, imageUrl: true },
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section
          aria-label="Hero"
          className="relative flex min-h-screen items-end overflow-hidden rounded-b-[28px]"
        >
          <div className="absolute inset-0">
            <Image
              src="/images/hero.jpg"
              alt="Woman in powerful fitness pose"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
          </div>

          {/* Mobile: stacked display headings */}
          <div className="absolute left-6 top-32 md:left-[8vw]">
            <div className="flex flex-col gap-2 md:hidden">
              <h1 className="font-heading -tracking-[0.01em] text-5xl font-extralight leading-none tracking-tight text-primary-foreground">
                <HeroWord word="Strength" />
              </h1>
              <h1 className="font-heading -tracking-[0.01em] text-5xl font-extralight leading-none tracking-tight text-primary-foreground">
                <HeroWord word="Redefined" />
              </h1>
            </div>
            {/* Desktop: Strength anchors the top-left */}
            <h1 className="font-heading hidden text-6xl font-extralight leading-none tracking-tight text-primary-foreground md:block md:text-[10vw] lg:text-[8vw]">
              <HeroWord word="Strength" />
            </h1>
          </div>

          {/* Desktop: Redefined floats bottom-right */}
          <h1 className="font-heading absolute bottom-52 right-[8vw] hidden text-right text-6xl font-extralight leading-none tracking-tight text-primary-foreground md:block md:text-[10vw] lg:text-[8vw]">
            <HeroWord word="Redefined" />
          </h1>

          {/* Bottom row: manifesto + CTA */}
          <div className="relative flex w-full flex-col items-start justify-between gap-8 px-6 pb-16 md:flex-row md:items-end md:px-[8vw] md:pb-20">
            <p className="max-w-md font-body text-sm leading-relaxed text-white/90 md:text-base">
              A sanctuary for women who choose to be extraordinary. Where every rep is a
              revolution and every class is a declaration.
            </p>
            <AuraButton href="/classes" variant="light" className="shrink-0">
              Secure your space
            </AuraButton>
          </div>
        </section>

        {/* ============ FIRST WEEK FREE ============ */}
        <section
          aria-labelledby="free-week"
          className="relative overflow-hidden rounded-b-[28px] bg-[#F0EFE9] py-24 md:py-36"
        >
          {/* butter/peach glow rising from the bottom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-35%] left-0 right-0 mx-auto h-[520px] w-full max-w-[800px] opacity-90"
            style={{
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              background: 'linear-gradient(to top, #F6BF8E, #FFFAA4)',
              filter: 'blur(60px)',
              transform: 'scale(1.79)',
            }}
          />
          <div className="relative">
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="flex flex-col items-center gap-6">
                {/* wheat-stalk line ornament, traced from the source */}
                <svg
                  width="112"
                  height="64"
                  viewBox="0 0 349.46 198.58"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="text-primary"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeMiterlimit="10"
                    vectorEffect="non-scaling-stroke"
                    d="M213.06,78.38C205.85,33.29,174.73.72,174.73.72c0,0-31.12,32.57-38.33,77.65"
                  />
                  <g>
                    <g>
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeMiterlimit="10"
                        vectorEffect="non-scaling-stroke"
                        d="M174.27,183.06C185.31,56.85,56.43,42.62,56.43,42.62c0,0-1.65,34.08,12.04,67.81"
                      />
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeMiterlimit="10"
                        vectorEffect="non-scaling-stroke"
                        d="M.68,123.37s59.59,115.17,173.4,59.52C118.44,69.08.68,123.37.68,123.37Z"
                      />
                    </g>
                    <g>
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeMiterlimit="10"
                        vectorEffect="non-scaling-stroke"
                        d="M175.19,183.06c-11.04-126.21,117.84-140.44,117.84-140.44,0,0,1.65,34.08-12.04,67.81"
                      />
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeMiterlimit="10"
                        vectorEffect="non-scaling-stroke"
                        d="M348.77,123.37s-59.59,115.17-173.4,59.52c55.65-113.81,173.4-59.52,173.4-59.52Z"
                      />
                    </g>
                  </g>
                </svg>
                <h2
                  id="free-week"
                  className="font-heading text-4xl font-light leading-tight tracking-tight text-primary md:text-5xl lg:text-6xl"
                >
                  Your first week free
                </h2>
                <p className="mx-auto max-w-lg font-body text-sm leading-relaxed text-primary/70 md:text-base">
                  Experience every class, meet every instructor, and feel the energy of AURA
                  before making your commitment. No strings, no pressure, just pure discovery.
                </p>
              </div>
              <AuraButton href="/pricing" variant="dark" className="shrink-0">
                Claim your week
              </AuraButton>
            </div>
          </div>
        </section>

        {/* ============ THE DISCIPLINES (dial + stacked cards) ============ */}
        <DisciplinesSection />

        {/* ============ SKY BANNER (Inhale / Exhale) ============ */}
        <section aria-label="Inhale, exhale" className="relative w-full">
          <div className="relative h-[480px] w-full overflow-hidden rounded-b-[28px] px-6 md:h-[640px] md:px-[8vw]">
            <Image
              src="/images/sky.jpg"
              alt="Sky"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-56 md:flex-row md:gap-16">
              <h2 className="font-heading select-none text-3xl font-thin italic tracking-tight text-primary-foreground md:text-5xl">
                Inhale
              </h2>
              {/* infinity loop with orbiting dot — the breathe motif */}
              <svg
                viewBox="-15 -15 1023.11 417.27"
                className="h-20 w-48 md:h-[135px] md:w-[340px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  id="infinity-path"
                  d="M496.56 193.64 C449.5 147.5 400 97.5 345 59.5 C296 25.5 241 1 186 0.5 C83 -0.5 0 82 0 193.64 C0 305 83 387.27 186 386.77 C241 386.27 296 362 345 328 C400 290 449.5 240 496.56 193.64 C543.5 147.5 593 97.5 648 59.5 C697 25.5 752 1 807 0.5 C910 -0.5 993.11 82 993.11 193.64 C993.11 305 910 387.27 807 386.77 C752 386.27 697 362 648 328 C593 290 543.5 240 496.56 193.64 Z"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="text-primary-foreground"
                />
                <circle r="10.5" fill="currentColor" className="text-primary-foreground">
                  <animateMotion
                    dur="6s"
                    repeatCount="indefinite"
                    path="M496.56 193.64 C449.5 147.5 400 97.5 345 59.5 C296 25.5 241 1 186 0.5 C83 -0.5 0 82 0 193.64 C0 305 83 387.27 186 386.77 C241 386.27 296 362 345 328 C400 290 449.5 240 496.56 193.64 C543.5 147.5 593 97.5 648 59.5 C697 25.5 752 1 807 0.5 C910 -0.5 993.11 82 993.11 193.64 C993.11 305 910 387.27 807 386.77 C752 386.27 697 362 648 328 C593 290 543.5 240 496.56 193.64 Z"
                  />
                </circle>
              </svg>
              <h2 className="font-heading select-none text-3xl font-thin italic tracking-tight text-primary-foreground md:text-5xl">
                Exhale
              </h2>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent py-8">
              <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-white md:text-xs">
                Move beautifully. Live powerfully.
              </p>
            </div>
          </div>
        </section>

        {/* ============ WHY AURA (coverflow) ============ */}
        <BenefitsCarousel />

        {/* ============ COACHES (accordion) ============ */}
        <CoachesSection coaches={instructors} />

        {/* ============ TESTIMONIALS ============ */}
        <section aria-labelledby="proof" className="relative overflow-hidden">
          <div className="container-aura">
            <div className="mb-16">
              <p className="kicker mb-4 text-primary">Proof of power</p>
              <h2
                id="proof"
                className="font-heading text-3xl font-light leading-tight tracking-tight text-primary md:text-5xl"
              >
                Their words, their results
              </h2>
            </div>
            <div className="grid gap-6 pb-24 md:grid-cols-3 md:pb-32">
              {TESTIMONIALS.map((t, i) => (
                <figure
                  key={t.name}
                  className="flex h-full flex-col justify-between bg-white p-8 shadow-[rgba(230,146,76,0.12)_0_12px_20px_4px] rounded-xl"
                >
                  <div>
                    <span className="font-body text-xs font-semibold tracking-[0.2em] text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <blockquote className="mt-6">
                      <p className="font-heading text-base font-extralight italic leading-relaxed text-primary md:text-lg">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </blockquote>
                  </div>
                  <figcaption className="mt-8 border-t border-border/50 pt-3">
                    <p className="font-body text-sm font-medium text-primary">{t.name}</p>
                    <p className="mt-1 text-xs tracking-wide text-primary">{t.result}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ============ GALLERY (collage + lightbox) ============ */}
        <GallerySection />
      </main>

      <SiteFooter />
    </div>
  )
}
