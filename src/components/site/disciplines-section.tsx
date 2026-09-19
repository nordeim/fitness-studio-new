'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { labelAngle, shortestRotationDelta } from '@/lib/domain/discipline-wheel'

export const DISCIPLINES = [
  {
    name: 'Yoga',
    image: '/images/yoga.jpg',
    tagline: 'Flow through strength and stillness.',
  },
  {
    name: 'HIIT',
    image: '/images/hiit.jpg',
    tagline: 'Push limits. Break barriers.',
  },
  {
    name: 'Pilates',
    image: '/images/pilates.jpg',
    tagline: 'Precision meets power.',
  },
  {
    name: 'Strength',
    image: '/images/strength.jpg',
    tagline: 'Lift heavy. Stand taller.',
  },
] as const

const RADIUS = 88 // px — labels ride the circle line (r=55 in a 120 viewBox on w-48)

/**
 * THE DISCIPLINES — the source app's signature dial: a sticky circular
 * selector on the left (labels rotate around the dial, the active one lands
 * upright at 12 o'clock) and the four discipline cards stacked on the right.
 * Scroll position drives the dial (scrollspy); clicking a label smooth-
 * scrolls to its card.
 */
export function DisciplinesSection() {
  const [active, setActive] = useState(0)
  const [rotation, setRotation] = useState(0)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  const select = (index: number) => {
    setActive((prev) => {
      if (prev !== index) {
        setRotation((r) => r + shortestRotationDelta(prev, index, DISCIPLINES.length))
      }
      return index
    })
  }

  // Scrollspy: the card occupying the viewport drives the dial
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.findIndex((el) => el === entry.target)
            if (idx >= 0) select(idx)
          }
        }
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      aria-labelledby="disciplines"
      className="grid min-h-screen grid-cols-1 gap-12 px-6 py-24 md:grid-cols-3 md:px-[8vw] md:py-32"
    >
      {/* Left: sticky heading + circular dial */}
      <div className="h-fit self-start md:sticky md:top-24">
        <p className="kicker mb-4 text-primary">The disciplines</p>
        <h2
          id="disciplines"
          className="font-heading max-w-sm text-left text-3xl font-light leading-tight tracking-tight text-primary md:text-4xl lg:text-5xl"
        >
          Find the perfect workout for you
        </h2>

        <div className="ml-6 mt-16">
          <div className="relative flex h-48 w-48 items-center justify-start">
            <svg
              className="absolute h-full w-full text-primary"
              viewBox="0 0 120 120"
              aria-hidden="true"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div
              className="absolute inset-0"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              {DISCIPLINES.map((d, i) => (
                <div
                  key={d.name}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${labelAngle(i, DISCIPLINES.length)}deg) translateY(-${RADIUS}px)` }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      select(i)
                      cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    aria-pressed={active === i}
                    className={cn(
                      'font-body pointer-events-auto absolute left-1/2 whitespace-nowrap text-xs transition-colors',
                      active === i
                        ? 'font-medium text-primary'
                        : 'font-light text-primary hover:text-primary/70',
                    )}
                    style={{ transform: 'translateX(-50%) translateY(-29px)' }}
                  >
                    {d.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: the four discipline cards, stacked */}
      <div className="md:col-span-2">
        <div className="space-y-6">
          {DISCIPLINES.map((d, i) => (
            <div
              key={d.name}
              id={`discipline-${d.name.toLowerCase()}`}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              className="scroll-mt-28"
            >
              <div className="group block">
                <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-row items-end justify-between gap-4 rounded-xl bg-gradient-to-t from-black/50 via-black/30 to-transparent p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-heading text-left text-2xl font-light text-white md:text-3xl">
                        {d.name}
                      </h3>
                      <p className="font-body text-sm text-white/80">{d.tagline}</p>
                    </div>
                    <Link
                      href={`/classes?type=${d.name}`}
                      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-primary transition-all duration-300 hover:px-5 hover:tracking-[0.2em]"
                    >
                      Book
                      <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All classes — right-aligned under the stack, measured off the source */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/classes"
            className="group inline-flex items-center gap-2 rounded bg-primary px-6 py-2.5 font-body text-xs font-medium uppercase tracking-[0.1em] text-primary-foreground transition-all duration-300 hover:tracking-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            All classes
            <ArrowUpRight
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
