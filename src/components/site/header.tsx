'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const MENU_LINKS = [
  { label: 'Classes', href: '/classes#schedule' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Instructors', href: '/instructors' },
] as const

/**
 * AURA header — measured from the source app:
 * - fixed, h-16, centered Taviraj wordmark running the 7.2s breathe pulse
 * - custom three-line burger on the right (w-6 / w-6 / w-4 hairlines)
 * - transparent + white over the espresso hero band at the top of every page
 * - past 64px of scroll: swaps to cream + espresso and slides out of view
 *   (translateY(-100%), opacity 0), sliding back at the top
 * - the menu is a cream dropdown panel: Taviraj 28px links, a solid
 *   "Book a class" button, studio hours at the bottom
 *
 * Deviation from source (fix): the source leaves the wordmark/burger white
 * over the cream panel (near-invisible); we switch the chrome to espresso
 * while the menu is open so the close control stays visible.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const hidden = scrolled && !open

  const closeMenu = () => setOpen(false)

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b rounded-b-[28px] transition-all duration-500',
          open || scrolled
            ? 'border-primary bg-background text-primary'
            : 'border-transparent bg-transparent text-white',
        )}
        style={{
          opacity: hidden ? 0 : 1,
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          transition:
            'opacity 0.4s, transform 0.4s, background-color 0.5s, border-color 0.5s',
        }}
      >
        <div className="relative flex h-16 items-center justify-end px-6 md:px-[8vw]">
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              aria-label="AURA home"
              onClick={closeMenu}
              className="font-heading animate-breathe inline-block text-lg font-thin focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              AURA
            </Link>
          </div>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 items-center justify-center p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex w-6 flex-col justify-center gap-[6px]" aria-hidden="true">
              <span
                className={cn(
                  'block h-[1px] w-6 bg-current transition-transform duration-300',
                  open && 'translate-y-[3.5px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'block h-[1px] w-6 bg-current transition-transform duration-300',
                  open && '-translate-y-[3.5px] -rotate-45',
                )}
              />
              <span
                className={cn(
                  'block h-[1px] w-4 bg-current transition-opacity duration-300',
                  open && 'opacity-0',
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Cream dropdown menu panel (sibling, not child, so the header's
          translate transform does not move it) */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed left-0 right-0 top-0 z-40 overflow-hidden bg-background transition-[max-height] duration-500 ease-in-out',
          open ? 'max-h-[560px]' : 'max-h-0 pointer-events-none',
        )}
      >
        <nav
          aria-label="Main"
          className="flex h-full flex-col justify-between px-6 pb-10 pt-20 md:px-[8vw]"
        >
          <div className="flex flex-col gap-5">
            {MENU_LINKS.map((link, i) => (
              <div
                key={link.href}
                style={{
                  opacity: open ? 1 : 0,
                  filter: open ? 'blur(0px)' : 'blur(4px)',
                  letterSpacing: open ? '0.02em' : '0.08em',
                  transition: `opacity 0.45s ${0.08 * (i + 1)}s, filter 0.45s ${0.08 * (i + 1)}s, letter-spacing 0.45s ${0.08 * (i + 1)}s`,
                }}
              >
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="font-heading block text-[28px] font-light leading-tight text-primary transition-colors hover:text-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <div
              style={{
                opacity: open ? 1 : 0,
                filter: open ? 'blur(0px)' : 'blur(4px)',
                transition: 'opacity 0.45s 0.32s, filter 0.45s 0.32s',
              }}
            >
              <Link
                href="/classes"
                onClick={closeMenu}
                className="inline-block rounded bg-primary px-6 py-2.5 font-body text-xs font-medium uppercase tracking-[0.1em] text-primary-foreground transition-all duration-300 hover:tracking-[0.18em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Book a class
              </Link>
            </div>
          </div>
          <div
            className="flex flex-col gap-1 font-body text-xs text-primary/50"
            style={{
              opacity: open ? 1 : 0,
              transition: 'opacity 0.45s 0.4s',
            }}
          >
            <span>Mon–Fri 6:00–21:00 · Sat–Sun 8:00–18:00</span>
            {/* Functional addition for the clone's real auth — not on source */}
            <Link
              href="/account"
              onClick={closeMenu}
              className="w-fit underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sign in / My bookings
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
