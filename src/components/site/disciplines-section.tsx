'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DISCIPLINES = [
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

/**
 * THE DISCIPLINES — tab strip switches the featured image; each card links
 * into the schedule filtered by its discipline.
 */
export function DisciplinesSection() {
  const [active, setActive] = useState(0)
  const current = DISCIPLINES[active] ?? DISCIPLINES[0]
  if (!current) return null

  return (
    <section
      aria-labelledby="disciplines"
      className="px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="kicker text-primary/60">The disciplines</p>
        <h2
          id="disciplines"
          className="font-heading mt-4 max-w-xl text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
        >
          Find the perfect workout for you
        </h2>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Featured image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
            {DISCIPLINES.map((d, i) => (
              <Image
                key={d.name}
                src={d.image}
                alt={d.name}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className={cn(
                  'object-cover transition-opacity duration-700',
                  i === active ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}
          </div>

          {/* Tabs + copy */}
          <div className="flex flex-col">
            <div role="tablist" aria-label="Disciplines" className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d, i) => (
                <button
                  key={d.name}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    'min-h-11 border px-5 py-2.5 font-body text-[11px] font-medium uppercase tracking-[0.25em] transition-colors',
                    i === active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-primary hover:border-primary',
                  )}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <h3 className="font-heading mt-8 text-4xl font-extralight italic tracking-tight text-primary">
              {current.name}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {current.tagline} Small-group coaching, expert eyes on every rep, and a room that
              wants you to win.
            </p>

            <Link
              href={`/classes?type=${current.name.toUpperCase()}`}
              className="group mt-8 inline-flex min-h-11 items-center gap-3 self-start border border-primary px-8 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Book
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/classes"
            className="group inline-flex min-h-11 items-center gap-3 bg-primary px-8 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            All classes
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
