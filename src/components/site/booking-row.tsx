'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cancelBookingAction, type BookingView } from '@/actions/bookings'
import { dayLabel, formatTimeClock, durationMinutes } from '@/lib/domain/class-filters'

const INTENSITY_BADGE: Record<string, string> = {
  LOW: 'bg-chart-4/60 text-primary',
  MEDIUM: 'bg-ring/30 text-primary',
  HIGH: 'bg-destructive/15 text-destructive',
}

export function BookingRow({ booking }: { booking: BookingView }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const cancel = async () => {
    const fd = new FormData()
    fd.set('bookingId', booking.id)
    const result = await cancelBookingAction(fd)
    if (result.ok) {
      toast.success('Booking cancelled — the spot is free for another queen.')
      router.refresh()
    } else {
      toast.error(result.error.message)
    }
  }

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/50">
          {dayLabel(booking.dayOfWeek)} · {formatTimeClock(booking.startTime)} –{' '}
          {formatTimeClock(booking.endTime)} · {durationMinutes(booking.startTime, booking.endTime)}{' '}
          min
        </p>
        <h3 className="font-heading mt-1.5 text-2xl font-light text-primary">
          {booking.classTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.classType} · {booking.instructorName ? `with ${booking.instructorName}` : 'AURA coaching'}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span
          className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
            INTENSITY_BADGE[booking.intensity] ?? 'bg-secondary text-primary'
          }`}
        >
          {booking.intensity}
        </span>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          className="min-h-11 border border-border px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.25em] text-primary/70 transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {isPending ? 'Cancelling…' : 'Cancel'}
        </button>
      </div>
    </li>
  )
}
