'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
 * WHY AURA — "Built different": white rounded-xl benefit cards in a
 * coverflow carousel over the cream→butter gradient, with round prev/next
 * controls on desktop. Keyboard: buttons are focusable; the carousel is
 * decorative-sequential, so no tab trapping is needed.
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

      {/* Desktop coverflow with side controls */}
      <div className="hidden md:flex w-full items-center justify-between gap-6">
        <button
          type="button"
          aria-label="Previous benefit"
          onClick={() => go(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div className="relative h-80 w-full">
          {BENEFITS.map((b, i) => {
            const raw = Math.abs(i - index)
            const distance = Math.min(raw, total - raw)
            const dir = i - index === 0 ? 0 : (i - index + total) % total <= total / 2 ? 1 : -1
            const slot = slotFor(distance)
            const translate = slot.translate * dir
            return (
              <article
                key={b.title}
                aria-hidden={distance >= 3}
                className="absolute left-1/2 ml-[-192px] flex h-80 w-96 flex-col justify-between rounded-xl bg-white px-8 py-10 transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${translate}px) scale(${slot.scale})`,
                  zIndex: slot.z,
                  opacity: slot.opacity,
                  boxShadow: 'rgba(230, 146, 76, 0.12) 0px 12px 20px 4px',
                  pointerEvents: distance === 0 ? 'auto' : 'none',
                }}
              >
                <div>
                  <span className="font-body text-xs font-semibold tracking-[0.2em] text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading mt-4 text-2xl font-light text-primary md:text-3xl">
                    {b.title}
                  </h3>
                </div>
                <p className="font-body text-sm leading-relaxed text-primary md:text-base">
                  {b.body}
                </p>
              </article>
            )
          })}
        </div>

        <button
          type="button"
          aria-label="Next benefit"
          onClick={() => go(1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile: current card only, swipe controls below */}
      <div className="md:hidden">
        <article
          className="flex h-80 flex-col justify-between rounded-xl bg-white px-8 py-10"
          style={{ boxShadow: 'rgba(230, 146, 76, 0.12) 0px 12px 20px 4px' }}
        >
          <div>
            <span className="font-body text-xs font-semibold tracking-[0.2em] text-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-heading mt-4 text-2xl font-light text-primary">
              {BENEFITS[index].title}
            </h3>
          </div>
          <p className="font-body text-sm leading-relaxed text-primary">{BENEFITS[index].body}</p>
        </article>
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Previous benefit"
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Benefits">
            {BENEFITS.map((b, i) => (
              <button
                key={b.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Benefit ${i + 1}: ${b.title}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  i === index ? 'bg-primary' : 'bg-primary/25',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next benefit"
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
