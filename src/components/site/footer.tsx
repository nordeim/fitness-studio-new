import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram } from 'lucide-react'

/**
 * AURA footer — the source app's finale: a full-bleed studio photograph
 * under a soft dark wash, a giant glowing "AURA STUDIO" wordmark drawn as
 * layered SVG text (sharp + two blurred passes through radial masks), the
 * three-column nav, and the legal rail. The wordmark is static on the
 * source (no marquee).
 */
export function SiteFooter() {
  return (
    <footer
      className="relative text-[#F0EFE9]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url("/images/footer-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* Giant glowing wordmark */}
      <div className="w-full px-6 py-8 md:px-[8vw] md:pt-16 md:pb-8" aria-hidden="true">
        <svg
          viewBox="0 0 1000 110"
          preserveAspectRatio="xMidYMid meet"
          className="block w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow-blur" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
            <filter id="soft-blur" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <radialGradient id="mask-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="55%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mask-gradient-inv" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="45%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </radialGradient>
            <mask id="glow-mask">
              <rect width="1000" height="110" fill="black" />
              <circle cx="500" cy="55" r="110" fill="url(#mask-gradient)" />
            </mask>
            <mask id="sharp-mask">
              <rect width="1000" height="110" fill="white" />
              <circle cx="500" cy="55" r="110" fill="url(#mask-gradient-inv)" />
            </mask>
          </defs>
          <text
            x="500"
            y="90"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
            fontWeight="100"
            fontSize="110"
            textLength="980"
            lengthAdjust="spacing"
            fill="currentColor"
            mask="url(#sharp-mask)"
          >
            AURA STUDIO
          </text>
          <text
            x="500"
            y="90"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
            fontWeight="100"
            fontSize="110"
            textLength="980"
            lengthAdjust="spacing"
            fill="currentColor"
            filter="url(#soft-blur)"
            mask="url(#glow-mask)"
            opacity="0.5"
          >
            AURA STUDIO
          </text>
          <text
            x="500"
            y="90"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
            fontWeight="100"
            fontSize="110"
            textLength="980"
            lengthAdjust="spacing"
            fill="currentColor"
            filter="url(#glow-blur)"
            mask="url(#glow-mask)"
            opacity="0.35"
          >
            AURA STUDIO
          </text>
        </svg>
      </div>

      <div className="px-6 py-8 md:px-[8vw] md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <p className="font-body max-w-xs text-sm leading-relaxed">
              A sanctuary for women who choose strength. Where every movement is a statement of
              power.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-6 text-xs uppercase tracking-[0.3em]">Navigate</p>
            <div className="flex flex-col gap-3">
              <Link href="/classes" className="text-sm tracking-wide transition-opacity hover:opacity-70">
                Classes
              </Link>
              <Link href="/pricing" className="text-sm tracking-wide transition-opacity hover:opacity-70">
                Pricing
              </Link>
              <Link href="/instructors" className="text-sm tracking-wide transition-opacity hover:opacity-70">
                Instructors
              </Link>
              {/* Functional addition for the clone's real auth — not on source */}
              <Link href="/account" className="text-sm tracking-wide transition-opacity hover:opacity-70">
                My Bookings
              </Link>
            </div>
          </nav>
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em]">Connect</p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>500 Terry Francine Street San Francisco, CA 94158</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <a href="tel:+11234567890" className="transition-opacity hover:opacity-70">
                  123-456-7890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <a href="mailto:info@mysite.com" className="transition-opacity hover:opacity-70">
                  info@mysite.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <a
                  href="https://instagram.com"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="transition-opacity hover:opacity-70"
                >
                  @sovereign.studio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 md:px-[8vw]">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs opacity-70 md:flex-row">
          <p>© {new Date().getFullYear()} AURA Studio. All rights reserved.</p>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className="transition-opacity hover:opacity-70">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-opacity hover:opacity-70">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="transition-opacity hover:opacity-70">
              Accessibility Statement
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
