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
      <SiteHeader variant="solid" />
      <main id="schedule" className="flex-1 scroll-mt-20 px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="kicker text-primary/60">The kinetic calendar</p>
          <h1 className="font-heading mt-4 text-5xl font-extralight italic tracking-tight text-primary md:text-7xl">
            Class schedule
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Find your flow. Filter by discipline, intensity, or day and secure your spot in
            seconds.
          </p>

          <ScheduleBrowser
            classes={sorted}
            initialFilters={filters}
            isAuthenticated={Boolean(user)}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
