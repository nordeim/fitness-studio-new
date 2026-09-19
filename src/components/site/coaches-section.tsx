'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Card geometry measured off the source accordion (1440px viewport). */
const CARD = 351 // collapsed width/height (px)
const INFO_W = 456 // expanded info panel width (px)
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

export interface CoachCardData {
  id: string
  name: string
  title: string
  bio: string
  imageUrl: string
}

/**
 * One desktop accordion row — measured from the source: coaches sit in
 * justify-between rows of two (1170px: expanded 791 + collapsed 351 + 28px
 * gap); each row is an INDEPENDENT accordion (clicking a coach only swaps
 * the active card within its own row), and the default active alternates
 * down the page (row 1 opens its first card, row 2 its last — the source's
 * diagonal composition). The active card springs open to reveal a gradient
 * info panel; a card in the second slot of a row opens mirror-image
 * (row-reverse) so the panel always grows into the row.
 */
function CoachRow({
  rowCoaches,
  baseIndex,
  defaultActive,
}: {
  rowCoaches: CoachCardData[]
  baseIndex: number
  defaultActive: number
}) {
  const [active, setActive] = useState(defaultActive)
  return (
    <div className="mb-8 hidden w-full justify-between md:flex" style={{ gap: '28px' }}>
      {rowCoaches.map((coach, j) => {
        const i = baseIndex + j
        const expanded = active === j
        const reversed = i % 2 === 1
        return (
          <button
            key={coach.id}
            type="button"
            onClick={() => setActive(j)}
            aria-expanded={expanded}
            aria-label={`${coach.name} — ${coach.title}`}
            className={cn(
              'group flex-shrink-0 overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              reversed ? 'flex-row-reverse' : 'flex-row',
              !expanded && 'cursor-pointer',
            )}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              width: expanded ? CARD + INFO_W : CARD,
              height: CARD,
              transition: `width 0.5s ${SPRING}`,
            }}
          >
            <div
              className="relative flex-shrink-0 overflow-hidden rounded-2xl bg-accent"
              style={{ width: CARD, minWidth: CARD, height: CARD }}
            >
              <Image
                src={coach.imageUrl}
                alt={coach.name}
                fill
                sizes="351px"
                className="object-cover object-top"
              />
            </div>
            <div
              className="coach-panel overflow-hidden"
              style={{
                width: expanded ? INFO_W : 0,
                flexShrink: 0,
                borderRadius: reversed ? '1rem 0 0 1rem' : '0 1rem 1rem 0',
                height: CARD,
                marginLeft: reversed ? 0 : -16,
                marginRight: reversed ? -16 : 0,
                paddingLeft: reversed ? 0 : 16,
                paddingRight: reversed ? 16 : 0,
                transition: `width 0.5s ${SPRING}`,
              }}
            >
              <div
                className="flex h-full flex-col justify-between p-6 text-left"
                style={{
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? 'translateX(0)' : 'translateX(12px)',
                  transition: 'opacity 0.35s 0.15s, transform 0.35s 0.15s',
                }}
              >
                <div>
                  <h3 className="font-heading mb-1 text-[28px] font-light leading-tight text-primary">
                    {coach.name}
                  </h3>
                  <p className="mb-4 text-xs uppercase tracking-[0.1em] text-primary">
                    {coach.title}
                  </p>
                </div>
                <p className="font-body text-xs tracking-[0.08em] text-primary/60">
                  {coach.bio}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * YOUR GUIDES — "Meet the coaches": the source app's interactive accordion
 * split into rows of two (a single row would overflow the 1170px container;
 * the source wraps the same way). Mobile gets stacked cards with the panel
 * below the photo.
 */
export function CoachesSection({ coaches }: { coaches: CoachCardData[] }) {
  if (coaches.length === 0) return null

  const rows: CoachCardData[][] = []
  for (let i = 0; i < coaches.length; i += 2) {
    rows.push(coaches.slice(i, i + 2))
  }

  return (
    <section aria-labelledby="coaches" className="rounded-b-[28px] py-24 md:py-32">
      <div className="container-aura mb-16">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="kicker mb-4 text-primary">Your guides</p>
            <h2
              id="coaches"
              className="font-heading text-3xl font-light leading-tight tracking-tight text-primary md:text-5xl"
            >
              Meet the coaches
            </h2>
          </div>
          <Link
            href="/instructors"
            className="group inline-flex items-center gap-2 rounded bg-primary px-6 py-2.5 font-body text-xs font-medium uppercase tracking-[0.1em] text-primary-foreground transition-all duration-300 hover:tracking-[0.2em]"
          >
            View all
            <ArrowUpRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      {/* Desktop accordion — rows of two, each an independent accordion */}
      <div className="container-aura">
        {rows.map((row, r) => (
          <CoachRow
            key={row[0]?.id ?? `row-${r}`}
            rowCoaches={row}
            baseIndex={r * 2}
            defaultActive={r % 2 === 0 ? 0 : Math.min(row.length - 1, 1)}
          />
        ))}

        {/* Mobile: stacked cards */}
        <div className="mb-8 flex flex-col gap-4 md:hidden">
          {coaches.map((coach) => (
            <div key={coach.id} className="w-full overflow-hidden rounded-lg">
              <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-accent">
                <Image
                  src={coach.imageUrl}
                  alt={coach.name}
                  fill
                  sizes="100vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="rounded-b-lg bg-gradient-to-b from-[#DAC2B9] to-[#F0EFE9] p-6">
                <h3 className="font-heading mb-1 text-lg font-light leading-tight text-primary">
                  {coach.name}
                </h3>
                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-primary">{coach.title}</p>
                <p className="font-body text-xs tracking-[0.08em] text-primary/60">{coach.bio}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
