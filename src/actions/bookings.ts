'use server'

/**
 * Booking server actions — capacity + duplicate checks run inside the write
 * transaction so concurrent bookers cannot oversell a class (the spotsTaken
 * counter is incremented under the row lock semantics of the serialized write).
 */
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { err, ok, withResult, type ActionResult } from '@/lib/result'
import { getCurrentUser } from '@/lib/auth/session'
import { planBookingWrite, bookingDenyMessage } from '@/lib/domain/booking-rules'
import { bookingSchema, cancelBookingSchema, toFieldErrors } from '@/lib/validation'

export interface BookingView {
  id: string
  classTitle: string
  classType: string
  intensity: string
  dayOfWeek: string
  startTime: string
  endTime: string
  instructorName: string | null
  status: string
  bookingDate: Date
}

export async function createBookingAction(
  formData: FormData,
): Promise<ActionResult<{ bookingId: string; spotsLeft: number }>> {
  return withResult(async () => {
    const user = await getCurrentUser()
    if (!user) {
      return err('UNAUTHENTICATED', 'Please sign in to book a class.')
    }

    const parsed = bookingSchema.safeParse({ classId: formData.get('classId') })
    if (!parsed.success) {
      return err('VALIDATION', 'Invalid booking request.', toFieldErrors(parsed.error))
    }

    const result = await db.$transaction(async (tx) => {
      const cls = await tx.studioClass.findUnique({
        where: { id: parsed.data.classId },
        // any prior row — cancelled or confirmed — occupies the unique key
        include: { bookings: { where: { userId: user.id } } },
      })
      if (!cls) return err('NOT_FOUND', 'That class no longer exists.')

      const prior = cls.bookings[0]
      const plan = planBookingWrite({
        capacity: cls.capacity,
        spotsTaken: cls.spotsTaken,
        existing: prior ? { id: prior.id, status: prior.status as 'confirmed' | 'cancelled' } : null,
      })

      if (plan.action === 'deny') {
        return err(
          plan.reason === 'DUPLICATE' ? 'CONFLICT' : 'CAPACITY_FULL',
          bookingDenyMessage(plan.reason),
        )
      }

      let bookingId = prior?.id ?? ''
      if (plan.action === 'reactivate') {
        await tx.booking.update({
          where: { id: plan.bookingId },
          data: { status: 'confirmed', bookingDate: new Date() },
        })
      } else {
        const booking = await tx.booking.create({
          data: { userId: user.id, classId: cls.id, status: 'confirmed' },
        })
        bookingId = booking.id
      }
      await tx.studioClass.update({
        where: { id: cls.id },
        data: { spotsTaken: { increment: 1 } },
      })
      return ok({ bookingId, spotsLeft: plan.spotsLeft })
    })

    if (result.ok) revalidatePath('/classes')
    if (result.ok) revalidatePath('/account')
    return result
  }, 'createBooking')
}

export async function cancelBookingAction(
  formData: FormData,
): Promise<ActionResult<{ cancelled: true }>> {
  return withResult(async () => {
    const user = await getCurrentUser()
    if (!user) {
      return err('UNAUTHENTICATED', 'Please sign in to manage your bookings.')
    }

    const parsed = cancelBookingSchema.safeParse({ bookingId: formData.get('bookingId') })
    if (!parsed.success) {
      return err('VALIDATION', 'Invalid cancellation request.', toFieldErrors(parsed.error))
    }

    const result = await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: parsed.data.bookingId },
      })
      if (!booking || booking.userId !== user.id) {
        return err('NOT_FOUND', 'Booking not found.')
      }
      if (booking.status !== 'confirmed') {
        return err('CONFLICT', 'This booking was already cancelled.')
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'cancelled' },
      })
      await tx.studioClass.update({
        where: { id: booking.classId },
        data: { spotsTaken: { decrement: 1 } },
      })
      return ok({ cancelled: true } as const)
    })

    if (result.ok) revalidatePath('/classes')
    if (result.ok) revalidatePath('/account')
    return result
  }, 'cancelBooking')
}

/** My-bookings read for the account page. */
export async function listMyBookings(): Promise<BookingView[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const rows = await db.booking.findMany({
    where: { userId: user.id, status: 'confirmed' },
    include: { studioClass: true },
    orderBy: [{ bookingDate: 'desc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    classTitle: r.studioClass.title,
    classType: r.studioClass.type,
    intensity: r.studioClass.intensity,
    dayOfWeek: r.studioClass.dayOfWeek,
    startTime: r.studioClass.startTime,
    endTime: r.studioClass.endTime,
    instructorName: r.studioClass.instructorName,
    status: r.status,
    bookingDate: r.bookingDate,
  }))
}

