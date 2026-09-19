import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { AuraButton } from '@/components/site/aura-button'
import { BookingRow } from '@/components/site/booking-row'
import { SignOutButton } from '@/components/site/sign-out-button'
import { getCurrentUser } from '@/lib/auth/session'
import { listMyBookings } from '@/actions/bookings'

export const metadata: Metadata = {
  title: 'My Bookings',
  description: 'Your upcoming classes at AURA Studio.',
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/account')

  const bookings = await listMyBookings()
  const firstName = (user.name ?? user.email).split(/[\s@]/)[0]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Espresso hero band — same page-header treatment as every inner page */}
        <section className="bg-primary px-6 pb-20 pt-36 text-primary-foreground md:px-[8vw] md:pb-28 md:pt-44">
          <div className="max-w-[1400px]">
            <p className="kicker mb-4 opacity-60">Member area</p>
            <h1 className="font-heading text-5xl font-light leading-tight md:text-7xl">
              Hello, {firstName}
            </h1>
            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm opacity-70">
              <span>Signed in as {user.email}</span>
              <span aria-hidden="true">·</span>
              <SignOutButton />
            </p>
          </div>
        </section>
        <section className="px-6 py-16 md:px-[8vw] md:py-24">
        <div className="mx-auto max-w-4xl">
          <section aria-labelledby="upcoming">
            <h2 id="upcoming" className="font-heading text-3xl font-light text-primary">
              Upcoming classes
            </h2>

            {bookings.length === 0 ? (
              <div className="mt-8 rounded-xl border border-border bg-secondary/40 px-8 py-16 text-center">
                <p className="font-heading text-2xl font-light italic text-primary">
                  No bookings yet
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                  Your week is a blank canvas. Pick a class and paint it with sweat.
                </p>
                <div className="mt-8 flex justify-center">
                  <AuraButton href="/classes" variant="dark">
                    Browse classes
                  </AuraButton>
                </div>
              </div>
            ) : (
              <ul className="mt-8 space-y-4">
                {bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </ul>
            )}
          </section>
        </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
