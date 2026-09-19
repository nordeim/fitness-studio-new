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
 * WHY AURA — horizontal benefits carousel on the butter-yellow accent field,
 * with numbered cards, arrows, and dot indicators.
 */
export function BenefitsCarousel() {
  const [index, setIndex] = useState(0)
  const total = BENEFITS.length

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total)

  return (
    <section
      aria-labelledby="why-aura"
      className="px-6 py-20 md:px-10 md:py-28"
      style={{ background: 'linear-gradient(to bottom, #F0EFE9, #FFFAA4)' }}
    >
      <div className="mx-auto max-w-6xl">
        <p className="kicker text-primary/60">Why AURA</p>
        <h2
          id="why-aura"
          className="font-heading mt-4 text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
        >
          Built different
        </h2>

        <div className="mt-12 flex items-center gap-4 md:gap-6">
          <button
            type="button"
            aria-label="Previous benefit"
            onClick={() => go(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/30 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <div
            className="scroll-elegant flex flex-1 gap-5 overflow-x-auto pb-2"
            role="group"
            aria-label="Benefits"
          >
            {BENEFITS.map((b, i) => (
              <article
                key={b.title}
                aria-current={i === index}
                className={cn(
                  'flex w-64 shrink-0 flex-col bg-background p-6 shadow-sm transition-all duration-500 md:w-72',
                  i === index ? 'ring-1 ring-primary/30' : 'opacity-70',
                )}
              >
                <span className="font-heading text-3xl font-extralight text-primary/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading mt-4 text-xl font-light leading-snug text-primary">
                  {b.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </article>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next benefit"
            onClick={() => go(1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/30 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Benefit position">
          {BENEFITS.map((b, i) => (
            <button
              key={b.title}
              role="tab"
              aria-selected={i === index}
              aria-label={`Benefit ${i + 1}: ${b.title}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === index ? 'bg-primary' : 'bg-primary/25 hover:bg-primary/50',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
