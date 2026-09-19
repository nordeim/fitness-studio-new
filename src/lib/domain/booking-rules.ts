/**
 * Pure booking domain rules — capacity, duplicates, cancellation window.
 * The server action layer enforces these inside the write transaction;
 * this module holds the logic so it can be property-tested.
 */

export interface BookableClass {
  capacity: number
  spotsTaken: number
}

export type BookingDenyReason = 'CAPACITY_FULL' | 'DUPLICATE'

export interface BookingCheck {
  allowed: boolean
  reason?: BookingDenyReason
  spotsLeft: number
}

/** Spots left, floored at zero. */
export function spotsLeft(cls: BookableClass): number {
  return Math.max(0, cls.capacity - cls.spotsTaken)
}

/**
 * May this member book this class?
 * - CAPACITY_FULL when the class is at capacity
 * - DUPLICATE when the member already holds a confirmed booking
 */
export function checkBooking(
  cls: BookableClass,
  hasConfirmedBooking: boolean,
): BookingCheck {
  const left = spotsLeft(cls)
  if (hasConfirmedBooking) return { allowed: false, reason: 'DUPLICATE', spotsLeft: left }
  if (left <= 0) return { allowed: false, reason: 'CAPACITY_FULL', spotsLeft: 0 }
  return { allowed: true, spotsLeft: left }
}

/** Customer-safe copy for each deny reason. */
export function bookingDenyMessage(reason: BookingDenyReason): string {
  switch (reason) {
    case 'CAPACITY_FULL':
      return 'This class is fully booked. Try another time or join the waitlist at the front desk.'
    case 'DUPLICATE':
      return "You're already booked into this class."
  }
}

/**
 * Cancellation window: bookings may be cancelled up to
 * CANCELLATION_WINDOW_HOURS before the class start.
 */
export const CANCELLATION_WINDOW_HOURS = 2

export interface CancelCheck {
  allowed: boolean
  hoursUntilClass?: number
}

/**
 * @param classStart ISO timestamp of the class start
 * @param now current time (injected for testability)
 */
export function checkCancellation(classStart: Date, now: Date): CancelCheck {
  const hoursUntil = (classStart.getTime() - now.getTime()) / 3_600_000
  return { allowed: hoursUntil >= CANCELLATION_WINDOW_HOURS, hoursUntilClass: hoursUntil }
}

/** Integer minor-units helpers — money is never a float (scandihaven invariant). */
export function formatMoney(cents: number, currency = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$' }
  const symbol = symbols[currency] ?? ''
  const whole = Math.trunc(cents / 100)
  const frac = Math.abs(cents % 100)
  return `${symbol}${whole}${frac > 0 ? `.${String(frac).padStart(2, '0')}` : ''}`
}

/** Serialize/deserialize JSON array columns (SQLite has no array type). */
export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function serializeJsonArray(items: readonly string[]): string {
  return JSON.stringify(items)
}
