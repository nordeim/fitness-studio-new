/**
 * Pure class-schedule domain logic — no I/O, fully unit-testable.
 * Mirrors the source app's filter semantics: TYPE / INTENSITY / DAY, where
 * "ALL" (or absent) means no constraint on that axis.
 */

export const CLASS_TYPES = ['YOGA', 'HIIT', 'PILATES', 'STRENGTH', 'BARRE', 'CYCLING'] as const
export type ClassType = (typeof CLASS_TYPES)[number]

export const INTENSITIES = ['LOW', 'MEDIUM', 'HIGH'] as const
export type Intensity = (typeof INTENSITIES)[number]

export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

export interface ClassFilterInput {
  type?: string | null
  intensity?: string | null
  day?: string | null
}

export interface NormalizedFilters {
  type: ClassType | null
  intensity: Intensity | null
  day: DayOfWeek | null
}

const isAll = (value: string | null | undefined): boolean =>
  !value || value.trim() === '' || value.trim().toUpperCase() === 'ALL'

/** Validate + normalize raw query params into typed filters (or null = no filter). */
export function normalizeFilters(input: ClassFilterInput): NormalizedFilters {
  const upper = (v: string | null | undefined) => v?.trim().toUpperCase() ?? null

  const type = upper(input.type)
  const intensity = upper(input.intensity)
  const day = upper(input.day)

  return {
    type: CLASS_TYPES.includes(type as ClassType) && !isAll(type) ? (type as ClassType) : null,
    intensity:
      INTENSITIES.includes(intensity as Intensity) && !isAll(intensity)
        ? (intensity as Intensity)
        : null,
    day: DAYS_OF_WEEK.includes(day as DayOfWeek) && !isAll(day) ? (day as DayOfWeek) : null,
  }
}

export interface ScheduleClassShape {
  type: string
  intensity: string
  dayOfWeek: string
}

/** Filter a class list by normalized filters. Pure. */
export function filterClasses<T extends ScheduleClassShape>(
  classes: readonly T[],
  filters: NormalizedFilters,
): T[] {
  return classes.filter((c) => {
    if (filters.type && c.type !== filters.type) return false
    if (filters.intensity && c.intensity !== filters.intensity) return false
    if (filters.day && c.dayOfWeek !== filters.day) return false
    return true
  })
}

export function hasActiveFilters(filters: NormalizedFilters): boolean {
  return filters.type !== null || filters.intensity !== null || filters.day !== null
}

/** Monday-first sort key for stable schedule ordering. */
export function daySortKey(day: string): number {
  const index = DAYS_OF_WEEK.indexOf(day.toUpperCase() as DayOfWeek)
  return index === -1 ? 99 : index
}

/** Sort by day (Mon first), then start time. Pure. */
export function sortClasses<T extends { dayOfWeek: string; startTime: string }>(
  classes: readonly T[],
): T[] {
  return [...classes].sort((a, b) => {
    const dayDiff = daySortKey(a.dayOfWeek) - daySortKey(b.dayOfWeek)
    if (dayDiff !== 0) return dayDiff
    return a.startTime.localeCompare(b.startTime)
  })
}

/** Human label for a day constant, e.g. MONDAY -> "Monday". */
export function dayLabel(day: string): string {
  const d = day.toLowerCase()
  return d.charAt(0).toUpperCase() + d.slice(1)
}

/** "18:30" -> "6:30 PM" — 12h display format used across the schedule UI. */
export function formatTimeClock(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw)
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return hhmm
  }
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Duration in minutes between two "HH:MM" strings (wraps midnight). */
export function durationMinutes(start: string, end: string): number {
  const toMin = (t: string): number => {
    const [h, m] = t.split(':').map(Number)
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0)
  }
  const diff = toMin(end) - toMin(start)
  return diff >= 0 ? diff : diff + 24 * 60
}
