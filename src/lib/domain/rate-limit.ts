/**
 * Fixed-window rate-limit policy — pure decision math, no I/O imports.
 *
 * Why this exists: the auth server actions (sign-in, sign-up, password
 * reset) accept unauthenticated input, so without a limiter they allow
 * unbounded password brute force, account spam, and reset-token flooding.
 * The decision itself is pure string/clock arithmetic so it can be held to
 * the domain seam's 100% coverage gate; the counters live in an in-process
 * store (see `lib/rate-limit-store.ts`) — single-instance deployments
 * (the documented SQLite topology) keep their state in the same process
 * that runs the actions.
 *
 * Fixed-window semantics (deliberately simple, no sliding window):
 * the Nth attempt within `windowMs` of the first attempt in that window is
 * allowed while `count < limit`; once `count` has reached the limit every
 * further attempt is denied until the window rolls over, at which point a
 * fresh window starts. Denied attempts never extend the window (a lockout
 * always ends within one window of when it began).
 */

export interface RateLimitState {
  /** Attempts consumed in the current window (starts at 1 — this attempt counts). */
  count: number
  /** Epoch-ms start of the current window. */
  windowStart: number
}

export interface RateLimitPolicy {
  /** Maximum attempts per window. */
  limit: number
  /** Window length in epoch-ms. */
  windowMs: number
}

export interface RateLimitDecision {
  allowed: boolean
  /** The state to persist for the key (unchanged when denied). */
  state: RateLimitState
  /** Epoch-ms until the window rolls over (0 when allowed). */
  retryAfterMs: number
}

/**
 * Decide whether the current attempt is allowed, and produce the next
 * counter state. `state` is the previously persisted state (undefined on a
 * first-ever attempt). `now` is epoch-ms — injected so tests pin the clock.
 */
export function evaluateRateLimit(
  state: RateLimitState | undefined,
  now: number,
  policy: RateLimitPolicy,
): RateLimitDecision {
  if (!state || now - state.windowStart >= policy.windowMs) {
    // First attempt, or the window has fully elapsed: start a fresh window.
    return { allowed: true, state: { count: 1, windowStart: now }, retryAfterMs: 0 }
  }

  if (state.count < policy.limit) {
    return {
      allowed: true,
      state: { count: state.count + 1, windowStart: state.windowStart },
      retryAfterMs: 0,
    }
  }

  // Window still open and the budget is spent: deny without touching state,
  // so a denied attempt neither extends the lockout nor inflates the count.
  return {
    allowed: false,
    state,
    retryAfterMs: state.windowStart + policy.windowMs - now,
  }
}

/**
 * Customer-safe wait copy for a denied attempt. Partial units round UP so
 * the message never promises a shorter wait than reality; non-positive
 * input clamps to the shortest honest sentence (a rolled-over window
 * between the decision and the render).
 */
export function formatRetryAfter(retryAfterMs: number): string {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1_000))
  if (seconds < 60) {
    return `Try again in ${seconds} second${seconds === 1 ? '' : 's'}.`
  }
  const minutes = Math.ceil(seconds / 60)
  return `Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
}
