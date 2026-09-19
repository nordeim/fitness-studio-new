import Link from 'next/link'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'

/**
 * Branded 404 — same content arc as the source (big 404, rule, "Page Not
 * Found", the offending path, a way home) rendered in the AURA design
 * system rather than the hosting platform's default slate screen.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="space-y-2">
            <h1 className="font-heading text-7xl font-light text-primary/30">404</h1>
            <div className="mx-auto h-0.5 w-16 bg-primary/25" aria-hidden="true" />
          </div>
          <div className="mt-6 space-y-3">
            <h2 className="font-heading text-2xl font-light text-primary">Page not found</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The page you were looking for could not be found in this application.
            </p>
          </div>
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded border border-border bg-background px-4 py-2.5 font-body text-xs font-medium uppercase tracking-[0.1em] text-primary transition-all duration-300 hover:tracking-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
