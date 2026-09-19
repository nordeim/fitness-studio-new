/**
 * Domain-logic tests at the agreed seams: class filters/scheduling helpers
 * and booking rules (pure modules, no DB). Expected values are worked
 * examples — never recomputed by the same code under test.
 */
import { describe, expect, it } from 'vitest'
import {
  normalizeFilters,
  filterClasses,
  hasActiveFilters,
  sortClasses,
  daySortKey,
  dayLabel,
  formatTimeClock,
  durationMinutes,
} from '../src/lib/domain/class-filters'
import {
  checkBooking,
  spotsLeft,
  bookingDenyMessage,
  checkCancellation,
  formatMoney,
  parseJsonArray,
} from '../src/lib/domain/booking-rules'

describe('normalizeFilters', () => {
  it('treats missing, empty, and "ALL" as no constraint', () => {
    for (const input of [{}, { type: '', intensity: 'ALL', day: 'all' }, { type: ' all ' }]) {
      const f = normalizeFilters(input)
      expect(f.type).toBeNull()
      expect(f.intensity).toBeNull()
      expect(f.day).toBeNull()
    }
  })

  it('uppercases and keeps valid enum values', () => {
    const f = normalizeFilters({ type: 'yoga', intensity: 'high', day: 'monday' })
    expect(f).toEqual({ type: 'YOGA', intensity: 'HIGH', day: 'MONDAY' })
  })

  it('drops unknown enum values (fail-open, not crash)', () => {
    const f = normalizeFilters({ type: 'AEROBICS', intensity: 'EXTREME', day: 'FUNDAY' })
    expect(f).toEqual({ type: null, intensity: null, day: null })
  })
})

describe('filterClasses', () => {
  const classes = [
    { type: 'YOGA', intensity: 'LOW', dayOfWeek: 'MONDAY' },
    { type: 'HIIT', intensity: 'HIGH', dayOfWeek: 'TUESDAY' },
    { type: 'YOGA', intensity: 'HIGH', dayOfWeek: 'WEDNESDAY' },
  ]

  it('returns everything when no filter is set', () => {
    expect(filterClasses(classes, normalizeFilters({}))).toHaveLength(3)
  })

  it('filters on each axis independently', () => {
    expect(filterClasses(classes, normalizeFilters({ type: 'yoga' }))).toHaveLength(2)
    expect(filterClasses(classes, normalizeFilters({ intensity: 'high' }))).toHaveLength(2)
    expect(filterClasses(classes, normalizeFilters({ day: 'monday' }))).toHaveLength(1)
  })

  it('intersects axes', () => {
    const f = normalizeFilters({ type: 'yoga', intensity: 'high' })
    const out = filterClasses(classes, f)
    expect(out).toEqual([{ type: 'YOGA', intensity: 'HIGH', dayOfWeek: 'WEDNESDAY' }])
  })

  it('hasActiveFlags matches non-empty filters', () => {
    expect(hasActiveFilters(normalizeFilters({}))).toBe(false)
    expect(hasActiveFilters(normalizeFilters({ type: 'yoga' }))).toBe(true)
  })
})

describe('schedule ordering and labels', () => {
  it('sorts Monday-first then by start time', () => {
    const sorted = sortClasses([
      { dayOfWeek: 'TUESDAY', startTime: '06:00' },
      { dayOfWeek: 'MONDAY', startTime: '18:00' },
      { dayOfWeek: 'MONDAY', startTime: '06:00' },
    ])
    expect(sorted.map((c) => c.dayOfWeek + c.startTime)).toEqual([
      'MONDAY06:00',
      'MONDAY18:00',
      'TUESDAY06:00',
    ])
  })

  it('daySortKey puts unknown days last', () => {
    expect(daySortKey('MONDAY')).toBe(0)
    expect(daySortKey('SUNDAY')).toBe(6)
    expect(daySortKey('NONSENSE')).toBeGreaterThan(6)
  })

  it('formats 12h clocks correctly including midnight and noon', () => {
    expect(formatTimeClock('00:15')).toBe('12:15 AM')
    expect(formatTimeClock('06:30')).toBe('6:30 AM')
    expect(formatTimeClock('12:00')).toBe('12:00 PM')
    expect(formatTimeClock('18:45')).toBe('6:45 PM')
  })

  it('returns malformed times unchanged (no crash)', () => {
    expect(formatTimeClock('banana')).toBe('banana')
  })

  it('dayLabel capitalizes', () => {
    expect(dayLabel('WEDNESDAY')).toBe('Wednesday')
  })

  it('computes durations and wraps midnight', () => {
    expect(durationMinutes('06:00', '07:00')).toBe(60)
    expect(durationMinutes('23:00', '00:30')).toBe(90)
  })
})

describe('booking rules', () => {
  it('allows booking when spots remain and no duplicate', () => {
    expect(checkBooking({ capacity: 16, spotsTaken: 15 }, false)).toEqual({
      allowed: true,
      spotsLeft: 1,
    })
  })

  it('denies at capacity', () => {
    const check = checkBooking({ capacity: 16, spotsTaken: 16 }, false)
    expect(check.allowed).toBe(false)
    expect(check.reason).toBe('CAPACITY_FULL')
    expect(check.spotsLeft).toBe(0)
  })

  it('duplicate wins over capacity (already booked means already booked)', () => {
    const check = checkBooking({ capacity: 16, spotsTaken: 16 }, true)
    expect(check.reason).toBe('DUPLICATE')
  })

  it('spotsLeft floors at zero (never negative)', () => {
    expect(spotsLeft({ capacity: 10, spotsTaken: 12 })).toBe(0)
  })

  it('deny messages are customer-safe (no internals)', () => {
    for (const msg of [
      bookingDenyMessage('CAPACITY_FULL'),
      bookingDenyMessage('DUPLICATE'),
    ]) {
      expect(msg).toMatch(/\.$/)
      expect(msg).not.toMatch(/prisma|sql|database/i)
    }
  })

  it('cancellation window: 2 hours or more before start', () => {
    const start = new Date('2026-06-01T18:00:00Z')
    expect(checkCancellation(start, new Date('2026-06-01T15:00:00Z')).allowed).toBe(true)
    expect(checkCancellation(start, new Date('2026-06-01T16:01:00Z')).allowed).toBe(false)
    expect(checkCancellation(start, new Date('2026-06-01T19:00:00Z')).allowed).toBe(false)
  })
})

describe('money and JSON columns', () => {
  it('formats integer cents without float drift', () => {
    expect(formatMoney(2800)).toBe('$28')
    expect(formatMoney(14900)).toBe('$149')
    expect(formatMoney(12050)).toBe('$120.50')
    expect(formatMoney(5)).toBe('$0.05')
  })

  it('parses JSON array columns defensively', () => {
    expect(parseJsonArray(null)).toEqual([])
    expect(parseJsonArray('[]')).toEqual([])
    expect(parseJsonArray('["a","b"]')).toEqual(['a', 'b'])
    expect(parseJsonArray('not json')).toEqual([])
    expect(parseJsonArray('["a", 42, null]')).toEqual(['a'])
    expect(parseJsonArray('{"a":1}')).toEqual([])
  })
})
