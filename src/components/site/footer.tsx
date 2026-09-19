import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram } from 'lucide-react'

/**
 * AURA footer: marquee "AURA STUDIO" strip over terracotta-to-espresso,
 * three columns (about / navigate / connect), legal rail.
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#8E3F19] to-primary text-primary-foreground">
      {/* Marquee wordmark */}
      <div aria-hidden="true" className="border-b border-primary-foreground/10 py-10 md:py-14">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="font-heading text-[13vw] font-extralight uppercase leading-none tracking-[0.08em] text-primary-foreground/90 md:text-[7vw]"
            >
              AURA STUDIO&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1.4fr] md:px-10">
        <div>
          <p className="font-heading text-2xl font-light italic leading-snug md:text-3xl">
            A sanctuary for women who choose strength.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            Where every movement is a statement of power.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="kicker text-primary-foreground/60">Navigate</h2>
          <ul className="mt-5 space-y-3">
            {[
              ['Classes', '/classes'],
              ['Pricing', '/pricing'],
              ['Instructors', '/instructors'],
              ['My Bookings', '/account'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="kicker text-primary-foreground/60">Connect</h2>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>500 Terry Francine Street, San Francisco, CA 94158</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <a href="tel:+11234567890" className="transition-colors hover:text-accent">
                123-456-7890
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <a href="mailto:info@mysite.com" className="transition-colors hover:text-accent">
                info@mysite.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Instagram className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <a
                href="https://instagram.com"
                rel="noopener noreferrer"
                target="_blank"
                className="transition-colors hover:text-accent"
              >
                @sovereign.studio
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-primary-foreground/50 md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} AURA Studio. All rights reserved.</p>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/legal/privacy" className="transition-colors hover:text-accent">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="transition-colors hover:text-accent">
              Terms of Service
            </Link>
            <Link href="/legal/accessibility" className="transition-colors hover:text-accent">
              Accessibility Statement
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
