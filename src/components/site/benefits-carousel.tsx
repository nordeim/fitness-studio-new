'use client'

import { useState } from 'react'

const BENEFITS = [
  {
    title: 'Women-Only Sanctuary',
    body: 'A space designed exclusively for women — where strength is celebrated without compromise.',
  },
  {
    title: 'Expert-Led Classes',
    body: 'Every instructor holds multiple certifications and brings years of real-world coaching experience.',
  },
  {
    title: 'Intimate Class Sizes',
    body: 'Maximum 16 per class ensures personalized attention and real connection with your coach.',
  },
  {
    title: 'Holistic Approach',
    body: 'We integrate mindfulness, nutrition guidance, and recovery into every membership experience.',
  },
  {
    title: 'Flexible Scheduling',
    body: 'Early morning to late evening classes, 7 days a week. Your journey fits your life.',
  },
  {
    title: 'Community of Queens',
    body: 'Join a tribe of ambitious women who lift each other up — on and off the studio floor.',
  },
] as const

/**
 * Coverflow slot geometry, measured off the source app:
 * offset 0 → center, scale 1, z-10; ±1 → 340px, 0.92, z-9;
 * ±2 → 680px, 0.84, z-8; ±3+ → 1020px, 0.76, z-7, opacity 0.
 * Distances wrap circularly (6 benefits).
 */
const SLOTS = [
  { translate: 0, scale: 1, z: 10, opacity: 1 },
  { translate: 340, scale: 0.92, z: 9, opacity: 1 },
  { translate: 680, scale: 0.84, z: 8, opacity: 1 },
  { translate: 1020, scale: 0.76, z: 7, opacity: 0 },
] as const

function slotFor(distance: number) {
  return SLOTS[Math.min(distance, SLOTS.length - 1)]
}

/**
 * The source's long-arrow glyph: a hairline with an open arrowhead
 * (viewBox 0 0 52.01 27.9, 1px non-scaling stroke). The previous control
 * is the same glyph rotated 180°.
 */
function LongArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52.01 27.9" className={className} aria-hidden="true" fill="none">
      <path
        d="M.75,13.95h49"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth={1}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M37.83,1.06l13.1,12.89-13.1,12.89"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth={1}
        strokeMiterlimit={10}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function BenefitCard({
  index,
  title,
  body,
  className,
  style,
  ariaHidden,
}: {
  index: number
  title: string
  body: string
  className?: string
  style?: React.CSSProperties
  ariaHidden?: boolean
}) {
  return (
    <article
      aria-hidden={ariaHidden}
      className={className}
      style={style}
    >
      <div>
        <span className="font-body text-xs font-semibold tracking-[0.2em] text-primary">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-heading mt-4 text-2xl font-light text-primary md:text-3xl">
          {title}
        </h3>
      </div>
      <p className="font-body text-sm leading-relaxed text-primary md:text-base">{body}</p>
    </article>
  )
}

/**
 * WHY AURA — "Built different": white rounded-xl benefit cards in a
 * coverflow carousel over the cream→butter gradient. Measured from the
 * source: the desktop stage is a full-width h-96 window; below it (gap-12)
 * sits a controls row — round long-arrow prev/next buttons at the gutters
 * with a dot rail between (active dot 10px espresso fill, inactive 8px
 * espresso-bordered). Mobile swaps the carousel for all six cards stacked
 * (px-6 py-8, gap-6) with no controls. The source's dots are passive
 * indicators (not clickable) — the buttons drive rotation.
 */
export function BenefitsCarousel() {
  const [index, setIndex] = useState(0)
  const total = BENEFITS.length

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total)

  return (
    <section
      aria-labelledby="why-aura"
      className="relative w-full bg-gradient-to-b from-background to-[#FFFAA4] px-6 py-24 md:px-[8vw] md:py-32"
    >
      <div className="mb-20">
        <p className="kicker mb-4 text-primary">Why AURA</p>
        <h2
          id="why-aura"
          className="font-heading text-3xl font-light leading-tight tracking-tight text-primary md:text-5xl"
        >
          Built different
        </h2>
      </div>

      <div className="relative flex w-full flex-col items-center gap-12">
        {/* Desktop coverflow window */}
        <div className="relative hidden h-96 w-full items-center justify-center overflow-hidden md:flex">
          {BENEFITS.map((b, i) => {
            const raw = Math.abs(i - index)
            const distance = Math.min(raw, total - raw)
            const dir = i - index === 0 ? 0 : (i - index + total) % total <= total / 2 ? 1 : -1
            const slot = slotFor(distance)
            const translate = slot.translate * dir
            return (
              <BenefitCard
                key={b.title}
                index={i}
                title={b.title}
                body={b.body}
                ariaHidden={distance >= 3}
                className="absolute left-1/2 ml-[-192px] flex h-80 w-96 flex-col justify-between rounded-xl bg-white px-8 py-10 transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${translate}px) scale(${slot.scale})`,
                  zIndex: slot.z,
                  opacity: slot.opacity,
                  boxShadow: 'rgba(230, 146, 76, 0.12) 0px 12px 20px 4px',
                  pointerEvents: distance === 0 ? 'auto' : 'none',
                }}
              />
            )
          })}
        </div>

        {/* Mobile: all six cards stacked, no controls */}
        <div className="flex w-full flex-col gap-6 md:hidden">
          {BENEFITS.map((b, i) => (
            <BenefitCard
              key={b.title}
              index={i}
              title={b.title}
              body={b.body}
              className="flex w-full flex-col justify-between rounded-xl bg-white px-6 py-8"
              style={{ boxShadow: 'rgba(230, 146, 76, 0.12) 0px 12px 20px 4px' }}
            />
          ))}
        </div>

        {/* Desktop controls: prev arrow · dot rail · next arrow */}
        <div className="hidden w-full items-center justify-between gap-6 md:flex">
          <button
            type="button"
            aria-label="Previous benefit"
            onClick={() => go(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-11 md:w-11"
          >
            <LongArrow className="h-6 w-6 rotate-180 text-primary md:h-7 md:w-7" />
          </button>
          <div className="flex items-center gap-3" aria-hidden="true">
            {BENEFITS.map((b, i) =>
              i === index ? (
                <div
                  key={b.title}
                  className="h-2.5 w-2.5 rounded-full bg-[#411401] transition-colors"
                />
              ) : (
                <div
                  key={b.title}
                  className="h-2 w-2 rounded-full border border-[#411401] bg-transparent transition-colors"
                />
              ),
            )}
          </div>
          <button
            type="button"
            aria-label="Next benefit"
            onClick={() => go(1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-11 md:w-11"
          >
            <LongArrow className="h-6 w-6 text-primary md:h-7 md:w-7" />
          </button>
        </div>
      </div>
    </section>
  )
}
