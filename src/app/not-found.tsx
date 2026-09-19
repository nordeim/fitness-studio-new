import Link from 'next/link'
import { Home } from 'lucide-react'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { NotFoundMessage } from '@/components/site/not-found-message'

/**
 * Branded 404 — the source renders the hosting platform's default slate
 * NotFound (slate-50 field, slate-300 digits, "Page Not Found", the quoted
 * offending path, a white Go Home button) inside the AURA chrome: fixed
 * header above, photo footer below. Reproduced here token-for-token.
 *
 * One fix: the source's header sits transparent+white over the light slate
 * field (an invisible wordmark); we pass `forceSolid` so the chrome stays
 * cream+espresso. Hide-on-scroll still applies.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader forceSolid />
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-32">
        <div className="w-full max-w-md text-center">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="mx-auto h-0.5 w-16 bg-slate-200" aria-hidden="true" />
          </div>
          <div className="mt-6 space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <NotFoundMessage />
          </div>
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              <Home className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Go Home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
