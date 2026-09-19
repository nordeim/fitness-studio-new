'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Collage layout measured off the source app: each image is absolutely
 * placed by left/top percentage with a fixed 285px width, varied heights,
 * a soft bottom fade (mask-image) and a subtle mouse-parallax nudge.
 */
const COLLAGE = [
  { src: '/images/gallery-1.jpg', alt: 'Gallery 1', left: '20%', top: '15%', h: 213, depth: 1 },
  { src: '/images/gallery-2.jpg', alt: 'Gallery 2', left: '50%', top: '12%', h: 159, depth: 1.6 },
  { src: '/images/gallery-3.jpg', alt: 'Gallery 3', left: '80%', top: '18%', h: 213, depth: 0.8 },
  { src: '/images/gallery-4.jpg', alt: 'Gallery 4', left: '35%', top: '50%', h: 213, depth: 1.3 },
  { src: '/images/gallery-5.jpg', alt: 'Gallery 5', left: '65%', top: '52%', h: 285, depth: 0.9 },
  { src: '/images/gallery-6.jpg', alt: 'Gallery 6', left: '15%', top: '75%', h: 285, depth: 1.5 },
  { src: '/images/gallery-7.jpg', alt: 'Gallery 7', left: '85%', top: '78%', h: 285, depth: 1.1 },
] as const

const W = 285 // fixed collage image width (px), from the source

/**
 * THE SPACE — "Where strength lives": a scattered, softly-fading photo
 * collage on a slowly shifting cream/white gradient, with mouse parallax.
 * Clicking any photo opens the lightbox (prev/next/close), like the source.
 */
export function GallerySection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setParallax({ x, y })
    }
    const onLeave = () => setParallax({ x: 0, y: 0 })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Lightbox: close on Escape, lock scroll
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? null : (i + COLLAGE.length - 1) % COLLAGE.length))
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? null : (i + 1) % COLLAGE.length))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox])

  return (
    <section
      aria-labelledby="space"
      className="animate-gradientShift border-t border-border/50 bg-[linear-gradient(#F0EFE9,white,#F0EFE9,white)] pb-10 pt-24 md:pb-12 md:pt-32"
      style={{ backgroundSize: '100% 400%' }}
    >
      <div className="mb-12 text-center">
        <p className="kicker mb-4 text-primary">The space</p>
        <h2
          id="space"
          className="font-heading text-3xl font-light leading-tight tracking-tight text-primary md:text-5xl"
        >
          Where strength lives
        </h2>
      </div>

      {/* Desktop collage */}
      <div
        ref={wrapRef}
        className="relative mx-auto mb-6 hidden h-[1200px] max-w-full overflow-hidden rounded-2xl md:block"
      >
        {COLLAGE.map((img, i) => (
          <button
            key={img.alt}
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`Open ${img.alt} in lightbox`}
            className="absolute transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            style={{
              left: img.left,
              top: img.top,
              width: W,
              height: img.h,
              transform: `translate(calc(-50% + ${parallax.x * 14 * img.depth}px), calc(-50% + ${parallax.y * 14 * img.depth}px))`,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={W}
              height={img.h}
              className="h-full w-full cursor-pointer rounded-lg object-cover transition-all duration-500"
              style={{ maskImage: 'linear-gradient(black 0%, rgba(0,0,0,0.4) 100%)' }}
            />
          </button>
        ))}
      </div>

      {/* Mobile grid */}
      <div className="grid grid-cols-2 gap-3 px-6 md:hidden">
        {COLLAGE.map((img, i) => (
          <button
            key={img.alt}
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`Open ${img.alt} in lightbox`}
            className="relative aspect-square overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Image src={img.src} alt={img.alt} fill sizes="50vw" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex h-full w-full max-w-4xl max-h-[90vh] flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close gallery viewer"
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="relative h-full w-full">
              <Image
                src={COLLAGE[lightbox].src}
                alt={COLLAGE[lightbox].alt}
                fill
                sizes="(min-width: 896px) 896px, 100vw"
                className="h-full w-full object-contain"
              />
            </div>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setLightbox((i) => (i === null ? null : (i + COLLAGE.length - 1) % COLLAGE.length))}
              className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setLightbox((i) => (i === null ? null : (i + 1) % COLLAGE.length))}
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
