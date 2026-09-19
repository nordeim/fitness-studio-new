import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { ScheduleBrowser } from '@/components/site/schedule-browser'
import { db } from '@/lib/db'
import {
  normalizeFilters,
  sortClasses,
  type NormalizedFilters,
} from '@/lib/domain/class-filters'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Class Schedule',
  description:
    'Find your flow. Filter by discipline, intensity, or day and secure your spot in seconds.',
}

export const dynamic = 'force-dynamic'

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; intensity?: string; day?: string }>
}) {
  const params = await searchParams
  const filters: NormalizedFilters = normalizeFilters(params)

  const [allClasses, user] = await Promise.all([
    db.studioClass.findMany({
      orderBy: [{ sortOrder: 'asc' }],
      include: { bookings: { where: { status: 'confirmed' }, select: { userId: true } } },
    }),
    getCurrentUser(),
  ])

  const myClassIds = new Set(
    allClasses.flatMap((c) => c.bookings.filter((b) => b.userId === user?.id).map((b) => c.id)),
  )

  const sorted = sortClasses(
    allClasses.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      intensity: c.intensity,
      dayOfWeek: c.dayOfWeek,
      startTime: c.startTime,
      endTime: c.endTime,
      capacity: c.capacity,
      spotsTaken: c.spotsTaken,
      description: c.description,
      instructorName: c.instructorName,
      requirements: c.requirements,
      bookedByMe: myClassIds.has(c.id),
    })),
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main id="schedule" className="flex-1 scroll-mt-20">
        {/* Espresso hero band — the source's page header on every inner page */}
        <section className="bg-primary px-6 pb-20 pt-36 text-primary-foreground md:px-[8vw] md:pb-28 md:pt-44">
          <div className="max-w-[1400px]">
            <p className="kicker mb-4 opacity-60">The kinetic calendar</p>
            <h1 className="font-heading text-5xl font-light leading-tight md:text-7xl">
              Class schedule
            </h1>
            <p className="mt-6 max-w-md font-body text-sm leading-relaxed opacity-70 md:text-base">
              Find your flow. Filter by discipline, intensity, or day and secure your spot in
              seconds.
            </p>
          </div>
        </section>

        {/* Filter rails + schedule */}
        <section className="px-6 py-16 md:px-[8vw] md:py-24">
          <div className="max-w-[1400px]">
            <ScheduleBrowser
              classes={sorted}
              initialFilters={filters}
              isAuthenticated={Boolean(user)}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
