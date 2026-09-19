'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AURA header: floating wordmark with breathe animation + hamburger menu.
 * variant="hero" renders cream text (over the dark hero image);
 * variant="solid" renders espresso text (over cream pages).
 */
export function SiteHeader({ variant = 'hero' }: { variant?: 'hero' | 'solid' }) {
  const [open, setOpen] = useState(false)

  // Close-on-navigate without effect-body setState: every menu link closes
  // the menu in its own onClick handler.
  const closeMenu = () => setOpen(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const wordmark =
    variant === 'hero' ? 'text-primary-foreground' : 'text-primary'
  const icon = variant === 'hero' ? 'text-primary-foreground' : 'text-primary'

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          aria-label="AURA home"
          className={cn(
            'font-body text-xl font-light uppercase tracking-[0.45em] animate-breathe',
            wordmark,
          )}
        >
          AURA
        </Link>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex h-11 w-11 items-center justify-center transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            icon,
          )}
        >
          {open ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Full-screen overlay menu */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-primary/95 backdrop-blur-sm transition-opacity duration-500 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav aria-label="Main" className="flex h-full flex-col items-center justify-center gap-8 px-6">
          <Link
            href="/classes"
            onClick={closeMenu}
            className="font-heading text-4xl font-extralight italic text-primary-foreground transition-colors hover:text-accent md:text-5xl"
          >
            Classes
          </Link>
          <Link
            href="/pricing"
            onClick={closeMenu}
            className="font-heading text-4xl font-extralight italic text-primary-foreground transition-colors hover:text-accent md:text-5xl"
          >
            Pricing
          </Link>
          <Link
            href="/instructors"
            onClick={closeMenu}
            className="font-heading text-4xl font-extralight italic text-primary-foreground transition-colors hover:text-accent md:text-5xl"
          >
            Instructors
          </Link>
          <Link
            href="/classes#schedule"
            onClick={closeMenu}
            className="mt-4 border border-primary-foreground px-8 py-3 font-body text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
          >
            Book a class
          </Link>
          <Link
            href="/account"
            onClick={closeMenu}
            className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/70 transition-colors hover:text-accent"
          >
            Sign in / My bookings
          </Link>
        </nav>
      </div>
    </header>
  )
}
