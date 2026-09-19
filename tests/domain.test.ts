/**
 * Domain-logic tests at the agreed seams: class filters/scheduling helpers
 * and booking rules (pure modules, no DB). Expected values are worked
 * examples — never recomputed by the same code under test.
 */
import { describe, expect, it } from 'vitest'
import {
  wheelRotation,
  labelAngle,
  shortestRotationDelta,
} from '../src/lib/domain/discipline-wheel'
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
  planBookingWrite,
  spotsLeft,
  bookingDenyMessage,
  checkCancellation,
  formatMoney,
  parseJsonArray,
} from '../src/lib/domain/booking-rules'
import { formatNotFoundCopy } from '../src/lib/domain/not-found'
import {
  quoteFaceVisible,
  nextActive,
} from '../src/lib/domain/testimonial-spotlight'

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
  it('plans a create when spots remain and no prior booking', () => {
    expect(planBookingWrite({ capacity: 16, spotsTaken: 15, existing: null })).toEqual({
      action: 'create',
      spotsLeft: 1,
    })
  })

  it('denies at capacity', () => {
    const plan = planBookingWrite({ capacity: 16, spotsTaken: 16, existing: null })
    expect(plan.action).toBe('deny')
    expect(plan.action === 'deny' && plan.reason).toBe('CAPACITY_FULL')
    expect(plan.spotsLeft).toBe(0)
  })

  it('duplicate wins over capacity (already booked means already booked)', () => {
    const plan = planBookingWrite({
      capacity: 16,
      spotsTaken: 16,
      existing: { id: 'b1', status: 'confirmed' },
    })
    expect(plan.action === 'deny' && plan.reason).toBe('DUPLICATE')
  })

  it('re-activates a cancelled booking instead of colliding with the unique constraint', () => {
    // regression: a cancelled row occupies @@unique([userId, classId]) forever,
    // so a fresh create crashes with P2002 — the plan must reactivate instead
    const plan = planBookingWrite({
      capacity: 16,
      spotsTaken: 10,
      existing: { id: 'b7', status: 'cancelled' },
    })
    expect(plan).toEqual({ action: 'reactivate', bookingId: 'b7', spotsLeft: 6 })
  })

  it('still denies re-activation when the class has since filled', () => {
    const plan = planBookingWrite({
      capacity: 16,
      spotsTaken: 16,
      existing: { id: 'b7', status: 'cancelled' },
    })
    expect(plan.action).toBe('deny')
    expect(plan.action === 'deny' && plan.reason).toBe('CAPACITY_FULL')
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

describe('discipline wheel rotation (measured from source dial)', () => {
  it('places the active label at 12 o’clock by counter-rotating the dial', () => {
    expect(wheelRotation(0, 4)).toBe(0)
    expect(wheelRotation(1, 4)).toBe(-90)
    expect(wheelRotation(2, 4)).toBe(-180)
    expect(wheelRotation(3, 4)).toBe(-270)
  })

  it('spaces labels evenly around the circle', () => {
    expect(labelAngle(0, 4)).toBe(0)
    expect(labelAngle(1, 4)).toBe(90)
    expect(labelAngle(3, 4)).toBe(270)
    expect(labelAngle(1, 6)).toBe(60)
  })

  it('always takes the shortest path when switching between neighbours', () => {
    // dial rotation for active i is -i*90deg; deltas are signed accordingly
    expect(shortestRotationDelta(0, 1, 4)).toBe(-90)
    expect(shortestRotationDelta(1, 2, 4)).toBe(-90)
    expect(shortestRotationDelta(0, 2, 4)).toBe(-180)
    // 3 -> 0 wraps counterclockwise (-90), 0 -> 3 wraps clockwise (+90)
    expect(shortestRotationDelta(3, 0, 4)).toBe(-90)
    expect(shortestRotationDelta(0, 3, 4)).toBe(90)
  })
})

describe('not-found copy (measured from the source 404)', () => {
  it('quotes the offending path without its leading slash', () => {
    expect(formatNotFoundCopy('/does-not-exist')).toBe(
      'The page "does-not-exist" could not be found in this application.',
    )
    expect(formatNotFoundCopy('/classes/yoga')).toBe(
      'The page "classes/yoga" could not be found in this application.',
    )
  })

  it('handles bare and root paths without double slashes', () => {
    expect(formatNotFoundCopy('does-not-exist')).toBe(
      'The page "does-not-exist" could not be found in this application.',
    )
    expect(formatNotFoundCopy('')).toBe(
      'The page "" could not be found in this application.',
    )
    expect(formatNotFoundCopy('/')).toBe(
      'The page "" could not be found in this application.',
    )
  })
})

describe('testimonial spotlight (measured from the source rotation)', () => {
  it('shows every quote before the band is revealed', () => {
    for (const i of [0, 1, 2]) {
      expect(quoteFaceVisible(i, { revealed: false, active: 0, hovered: null })).toBe(true)
    }
  })

  it('shows only the active card’s quote while rotating', () => {
    // active 1 → card 1 quote, cards 0 and 2 numbers
    expect(quoteFaceVisible(0, { revealed: true, active: 1, hovered: null })).toBe(false)
    expect(quoteFaceVisible(1, { revealed: true, active: 1, hovered: null })).toBe(true)
    expect(quoteFaceVisible(2, { revealed: true, active: 1, hovered: null })).toBe(false)
  })

  it('freezes on the hovered card and hides the rest, active notwithstanding', () => {
    const state = { revealed: true, active: 2, hovered: 0 }
    expect(quoteFaceVisible(0, state)).toBe(true)
    expect(quoteFaceVisible(1, state)).toBe(false)
    expect(quoteFaceVisible(2, state)).toBe(false) // active loses to hovered
  })

  it('advances the spotlight forward and wraps', () => {
    expect(nextActive(0, 3)).toBe(1)
    expect(nextActive(1, 3)).toBe(2)
    expect(nextActive(2, 3)).toBe(0)
  })
})
