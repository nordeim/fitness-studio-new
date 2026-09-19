import { describe, expect, it } from 'vitest'

import {
  evaluateRateLimit,
  formatRetryAfter,
  type RateLimitPolicy,
  type RateLimitState,
} from '../src/lib/domain/rate-limit'

// Worked-example policy: 3 attempts per 10 minutes.
const policy: RateLimitPolicy = { limit: 3, windowMs: 10 * 60_000 }
const WINDOW_START = 1_000_000

describe('evaluateRateLimit (fixed-window counter)', () => {
  it('allows a first-ever attempt and starts a fresh window', () => {
    const now = WINDOW_START + 5_000
    const decision = evaluateRateLimit(undefined, now, policy)
    expect(decision.allowed).toBe(true)
    expect(decision.state).toEqual({ count: 1, windowStart: now })
    expect(decision.retryAfterMs).toBe(0)
  })

  it('counts up within the window and allows while under the limit', () => {
    const state: RateLimitState = { count: 1, windowStart: WINDOW_START }
    const second = evaluateRateLimit(state, WINDOW_START + 60_000, policy)
    expect(second.allowed).toBe(true)
    expect(second.state).toEqual({ count: 2, windowStart: WINDOW_START })

    const third = evaluateRateLimit(second.state, WINDOW_START + 120_000, policy)
    expect(third.allowed).toBe(true)
    expect(third.state).toEqual({ count: 3, windowStart: WINDOW_START })
  })

  it('denies once the count has reached the limit, keeping the state frozen', () => {
    const state: RateLimitState = { count: 3, windowStart: WINDOW_START }
    const decision = evaluateRateLimit(state, WINDOW_START + 30_000, policy)
    expect(decision.allowed).toBe(false)
    expect(decision.state).toEqual({ count: 3, windowStart: WINDOW_START })
    expect(decision.retryAfterMs).toBe(10 * 60_000 - 30_000)
  })

  it('keeps denying for the rest of the window (retryAfter shrinks toward zero)', () => {
    const state: RateLimitState = { count: 3, windowStart: WINDOW_START }
    const late = evaluateRateLimit(state, WINDOW_START + 10 * 60_000 - 1, policy)
    expect(late.allowed).toBe(false)
    expect(late.retryAfterMs).toBe(1)
  })

  it('rolls the window over at the exact boundary and allows again', () => {
    const state: RateLimitState = { count: 3, windowStart: WINDOW_START }
    const now = WINDOW_START + 10 * 60_000 // exactly one full window later
    const decision = evaluateRateLimit(state, now, policy)
    expect(decision.allowed).toBe(true)
    expect(decision.state).toEqual({ count: 1, windowStart: now })
    expect(decision.retryAfterMs).toBe(0)
  })

  it('rolls the window over even when the clock jumped far ahead', () => {
    const state: RateLimitState = { count: 3, windowStart: WINDOW_START }
    const now = WINDOW_START + 86_400_000
    const decision = evaluateRateLimit(state, now, policy)
    expect(decision.allowed).toBe(true)
    expect(decision.state).toEqual({ count: 1, windowStart: now })
  })

  it('allows a limit of 1 to deny the immediate second attempt', () => {
    const single: RateLimitPolicy = { limit: 1, windowMs: 60_000 }
    const first = evaluateRateLimit(undefined, WINDOW_START, single)
    expect(first.allowed).toBe(true)
    const second = evaluateRateLimit(first.state, WINDOW_START + 1, single)
    expect(second.allowed).toBe(false)
    expect(second.retryAfterMs).toBe(59_999)
  })
})

describe('formatRetryAfter (customer-safe wait copy)', () => {
  it('renders sub-second waits as one second', () => {
    expect(formatRetryAfter(1)).toBe('Try again in 1 second.')
  })

  it('renders whole-second waits without rounding up', () => {
    expect(formatRetryAfter(30_000)).toBe('Try again in 30 seconds.')
  })

  it('rounds partial seconds up so the copy never promises too little', () => {
    expect(formatRetryAfter(30_500)).toBe('Try again in 31 seconds.')
  })

  it('switches to minutes at a full minute', () => {
    expect(formatRetryAfter(60_000)).toBe('Try again in 1 minute.')
  })

  it('rounds partial minutes up', () => {
    expect(formatRetryAfter(60_001)).toBe('Try again in 2 minutes.')
    expect(formatRetryAfter(9 * 60_000 + 59_999)).toBe('Try again in 10 minutes.')
  })

  it('clamps non-positive waits to the shortest honest copy', () => {
    expect(formatRetryAfter(0)).toBe('Try again in 1 second.')
    expect(formatRetryAfter(-5_000)).toBe('Try again in 1 second.')
  })
})
