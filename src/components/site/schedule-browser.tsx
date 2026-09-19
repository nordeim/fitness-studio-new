'use client'

import { useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CLASS_TYPES,
  INTENSITIES,
  DAYS_OF_WEEK,
  filterClasses,
  hasActiveFilters,
  dayLabel,
  formatTimeClock,
  durationMinutes,
  type NormalizedFilters,
} from '@/lib/domain/class-filters'
import { spotsLeft } from '@/lib/domain/booking-rules'
import { createBookingAction } from '@/actions/bookings'

export interface ScheduleClassView {
  id: string
  title: string
  type: string
  intensity: string
  dayOfWeek: string
  startTime: string
  endTime: string
  capacity: number
  spotsTaken: number
  description: string | null
  instructorName: string | null
  requirements: string | null
  bookedByMe: boolean
}

/**
 * Class schedule browser: three filter rails (TYPE / INTENSITY / DAY) that
 * sync to the URL query, plus book buttons wired to the booking action.
 */
export function ScheduleBrowser({
  classes,
  initialFilters,
  isAuthenticated,
}: {
  classes: ScheduleClassView[]
  initialFilters: NormalizedFilters
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => filterClasses(classes, initialFilters), [classes, initialFilters])
  const active = hasActiveFilters(initialFilters)

  const setFilter = (axis: 'type' | 'intensity' | 'day', value: string | null) => {
    const params = new URLSearchParams()
    const next = { ...initialFilters }
    if (axis === 'type') next.type = value as NormalizedFilters['type']
    if (axis === 'intensity') next.intensity = value as NormalizedFilters['intensity']
    if (axis === 'day') next.day = value as NormalizedFilters['day']
    if (next.type) params.set('type', next.type)
    if (next.intensity) params.set('intensity', next.intensity)
    if (next.day) params.set('day', next.day)
    const qs = params.toString()
    startTransition(() => router.push(qs ? `/classes?${qs}` : '/classes', { scroll: false }))
  }

  const clearAll = () => startTransition(() => router.push('/classes', { scroll: false }))

  const book = async (classId: string) => {
    const fd = new FormData()
    fd.set('classId', classId)
    const result = await createBookingAction(fd)
    if (result.ok) {
      toast.success('You\u2019re booked. See you on the floor.')
      router.refresh()
    } else if (result.error.code === 'UNAUTHENTICATED') {
      toast.error('Please sign in to book a class.')
      router.push('/login?redirect=/classes')
    } else {
      toast.error(result.error.message)
    }
  }

  const railButton = (label: string, pressed: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'min-h-11 border px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.25em] transition-colors',
        pressed
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-primary/70 hover:border-primary hover:text-primary',
      )}
    >
      {label}
    </button>
  )

  return (
    <div aria-busy={isPending}>
      {/* TYPE */}
      <div className="mt-10">
        <h2 className="kicker text-primary/60">Type</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {railButton('All', !initialFilters.type, () => setFilter('type', null))}
          {CLASS_TYPES.map((t) =>
            railButton(t, initialFilters.type === t, () => setFilter('type', t)),
          )}
        </div>
      </div>

      {/* INTENSITY */}
      <div className="mt-8">
        <h2 className="kicker text-primary/60">Intensity</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {railButton('All', !initialFilters.intensity, () => setFilter('intensity', null))}
          {INTENSITIES.map((i) =>
            railButton(i, initialFilters.intensity === i, () => setFilter('intensity', i)),
          )}
        </div>
      </div>

      {/* DAY */}
      <div className="mt-8">
        <h2 className="kicker text-primary/60">Day</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {railButton('All', !initialFilters.day, () => setFilter('day', null))}
          {DAYS_OF_WEEK.map((d) =>
            railButton(d, initialFilters.day === d, () => setFilter('day', d)),
          )}
        </div>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="mt-14 rounded-xl border border-border bg-secondary/40 px-8 py-16 text-center">
          <p className="font-heading text-2xl font-light italic text-primary">
            No classes match your filters
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Try widening a rail or two — the week is full of options.
          </p>
          {active && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 min-h-11 border border-primary px-6 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const left = spotsLeft(c)
            const full = left <= 0
            const intensityStyles: Record<string, string> = {
              LOW: 'border-chart-4/60 text-chart-4',
              MEDIUM: 'border-ring/50 text-ring',
              HIGH: 'border-destructive/50 text-destructive',
            }
            return (
              <li
                key={c.id}
                className="flex flex-col rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/50">
                      {dayLabel(c.dayOfWeek)} · {formatTimeClock(c.startTime)} –{' '}
                      {formatTimeClock(c.endTime)}
                    </p>
                    <h3 className="font-heading mt-2 text-2xl font-light text-primary">
                      {c.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]',
                      intensityStyles[c.intensity] ?? 'border-border text-muted-foreground',
                    )}
                  >
                    {c.intensity}
                  </span>
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>

                <dl className="mt-4 space-y-1.5 text-xs text-primary/70">
                  <div className="flex gap-2">
                    <dt className="sr-only">Discipline</dt>
                    <dd className="font-medium uppercase tracking-[0.15em]">{c.type}</dd>
                    <dt className="sr-only">Duration</dt>
                    <dd aria-hidden="true">·</dd>
                    <dd>{durationMinutes(c.startTime, c.endTime)} min</dd>
                  </div>
                  {c.instructorName && (
                    <div className="flex gap-2">
                      <dt className="sr-only">Instructor</dt>
                      <dd>with {c.instructorName}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      full ? 'text-destructive' : 'text-primary/60',
                    )}
                    role="status"
                  >
                    {full ? 'Fully booked' : `${left} of ${c.capacity} spots left`}
                  </span>
                  {c.bookedByMe ? (
                    <span className="flex min-h-11 items-center border border-primary/40 bg-secondary/60 px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
                      Booked ✓
                    </span>
                  ) : full ? (
                    <span className="flex min-h-11 items-center border border-border px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                      Full
                    </span>
                  ) : isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => book(c.id)}
                      className="min-h-11 bg-primary px-6 py-2 font-body text-[11px] font-medium uppercase tracking-[0.25em] text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      Book
                    </button>
                  ) : (
                    <Link
                      href="/login?redirect=/classes"
                      className="flex min-h-11 items-center border border-primary px-6 py-2 font-body text-[11px] font-medium uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      Sign in to book
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
