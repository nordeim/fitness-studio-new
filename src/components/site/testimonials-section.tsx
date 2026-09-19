'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  quoteFaceVisible,
  nextActive,
  type SpotlightState,
} from '@/lib/domain/testimonial-spotlight'

const TESTIMONIALS = [
  {
    quote:
      "Sovereign didn't just change my body — it rewired my entire relationship with strength. I walk taller now.",
    name: 'Jordan K.',
    result: 'Lost 30 lbs in 4 months',
  },
  {
    quote:
      "The coaches here see something in you before you see it yourself. That's the magic of this place.",
    name: 'Priya M.',
    result: 'Completed first marathon',
  },
  {
    quote:
      "After years of pain, the Pilates program gave me my mobility back. I'm stronger at 45 than I was at 25.",
    name: 'Lena R.',
    result: 'Overcame chronic back pain',
  },
] as const

/** One card's turn in the spotlight (measured: ~3s slots, 9s full cycle). */
const SLOT_MS = 3000
/** Both layers crossfade at this speed (measured off the source transitions). */
const FADE_MS = 1200

/**
 * PROOF OF POWER — measured rebuild of the source testimonials band:
 * a full-bleed studio photograph under a bg-black/20 wash, white kicker
 * and heading, and three 260px flip-cards. Before the band enters the
 * viewport every card shows its quote face (cream card). Once revealed,
 * a spotlight rotation lights one card's quote at a time while the other
 * two dissolve to giant Taviraj numbers over the photo; hovering (or
 * focusing) a card freezes the rotation on it. Rotation math lives in
 * `lib/domain/testimonial-spotlight` (tested); reduced-motion users get
 * the static all-quotes band.
 */
export function TestimonialsSection() {
  const [revealed, setRevealed] = useState(false)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const hoveredRef = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Arm the rotation only when the band enters the viewport (and motion is allowed)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setRevealed(true)
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The spotlight rotation — frozen while a card is hovered/focused
  useEffect(() => {
    if (!revealed) return
    const iv = setInterval(() => {
      if (hoveredRef.current !== null) return
      setActive((a) => nextActive(a, TESTIMONIALS.length))
    }, SLOT_MS)
    return () => clearInterval(iv)
  }, [revealed])

  const state: SpotlightState = { revealed, active, hovered }

  return (
    <section ref={sectionRef} aria-labelledby="proof" className="relative overflow-hidden">
      {/* photo backdrop + soft dark wash (z-0) */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/testimonials-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/20" aria-hidden="true" />

      <div className="relative z-10 w-full px-6 py-24 md:px-[8vw] md:py-32">
        <div className="mb-16">
          <p className="kicker mb-4 text-white">Proof of power</p>
          <h2
            id="proof"
            className="font-heading text-3xl font-light leading-tight tracking-tight text-white md:text-5xl"
          >
            Their words, their results
          </h2>
        </div>

        <div className="grid gap-[26px] md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => {
            const quoteFace = quoteFaceVisible(i, state)
            return (
              <figure
                key={t.name}
                tabIndex={0}
                onMouseEnter={() => {
                  setHovered(i)
                  hoveredRef.current = i
                }}
                onMouseLeave={() => {
                  setHovered(null)
                  hoveredRef.current = null
                }}
                onFocus={() => {
                  setHovered(i)
                  hoveredRef.current = i
                }}
                onBlur={() => {
                  setHovered(null)
                  hoveredRef.current = null
                }}
                className="relative flex h-[260px] flex-col justify-center overflow-hidden rounded-2xl border transition-[background-color,border-color] ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{
                  backgroundColor: quoteFace ? 'var(--background)' : 'transparent',
                  borderColor: quoteFace ? 'transparent' : '#F0EFE9',
                  transitionDuration: `${FADE_MS}ms`,
                }}
              >
                {/* giant number — the resting face over the photo */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center text-6xl font-extralight text-[#F0EFE9] ease-in-out"
                  style={{ opacity: quoteFace ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-in-out` }}
                >
                  {i + 1}
                </span>

                {/* the quote face — visible at rest, dissolves under the number */}
                <div
                  className="absolute inset-0 flex h-full w-full flex-col justify-between p-8 ease-in-out"
                  style={{ opacity: quoteFace ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}
                >
                  <blockquote>
                    <p className="font-heading text-base font-extralight italic leading-relaxed text-primary md:text-lg">
                      "{t.quote}"
                    </p>
                  </blockquote>
                  <figcaption className="mt-3 border-t border-border/50 pt-3">
                    <p className="font-body text-sm font-medium text-primary">{t.name}</p>
                    <p className="mt-1 text-xs tracking-wide text-primary">{t.result}</p>
                  </figcaption>
                </div>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
