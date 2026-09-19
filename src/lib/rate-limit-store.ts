/**
 * In-process fixed-window rate-limit counters for the auth actions.
 *
 * The decision math is pure (`lib/domain/rate-limit.ts`); this module owns
 * the mutable state — a module-level Map keyed by `<action>:<dimension>:<identity>`
 * (e.g. `signin:ip:1.2.3.4`). Single-process by design: the documented
 * deployment topology is a single SQLite-backed instance, so the counters
 * live exactly where the actions run. (Horizontal scale would move these
 * counters to a shared store — Redis or a DB table — before adding
 * replicas; noted in the PAD §6 security model.)
 *
 * Counters are memory-only: a restart clears them, which is acceptable for
 * a brute-force speed limiter — an attacker restarts from zero, but so does
 * the lockout of a legitimate member.
 */
import { headers } from 'next/headers'

import { evaluateRateLimit, type RateLimitPolicy, type RateLimitState } from '@/lib/domain/rate-limit'

interface CounterRecord {
  state: RateLimitState
  policy: RateLimitPolicy
}

const globalForRateLimit = globalThis as unknown as {
  // Survives dev HMR reloads like the Prisma client does (same rationale).
  auraRateLimitStore: Map<string, CounterRecord> | undefined
}

const store: Map<string, CounterRecord> =
  globalForRateLimit.auraRateLimitStore ?? new Map<string, CounterRecord>()

if (process.env.NODE_ENV !== 'production') globalForRateLimit.auraRateLimitStore = store

/** Prune fully-elapsed windows so the map cannot grow without bound. */
function pruneExpired(now: number): void {
  // Amortized: sweep at most when the map has grown past a sane ceiling for
  // this app's traffic (each key is ~30 bytes; 10k keys ≈ 300 KB).
  if (store.size < 10_000) return
  for (const [key, record] of store) {
    if (now - record.state.windowStart >= record.policy.windowMs) store.delete(key)
  }
}

export interface RateLimitOutcome {
  allowed: boolean
  /** Epoch-ms until the window rolls over (meaningful only when denied). */
  retryAfterMs: number
}

/**
 * Check-and-consume in one step: the current attempt is counted against the
 * policy, and the decision tells the caller whether that attempt was within
 * budget. Denied attempts leave the counter frozen (see the pure module), so
 * a lockout always ends within one window.
 */
export function consumeRateLimit(key: string, policy: RateLimitPolicy): RateLimitOutcome {
  const now = Date.now()
  pruneExpired(now)
  const decision = evaluateRateLimit(store.get(key)?.state, now, policy)
  if (decision.allowed) store.set(key, { state: decision.state, policy })
  return { allowed: decision.allowed, retryAfterMs: decision.retryAfterMs }
}

/**
 * The client IP behind the deployment's reverse proxy. `x-forwarded-for`
 * carries the original visitor first (client, proxy1, proxy2, …); fall back
 * through the common single-hop headers to `unknown` — which rate-limits
 * direct/dev traffic as one shared bucket rather than not at all.
 */
export function clientIpFromHeaderList(headerList: Headers): string {
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headerList.get('x-real-ip')?.trim() || 'unknown'
}

export async function clientIp(): Promise<string> {
  return clientIpFromHeaderList(await headers())
}

/**
 * The auth limiter policies (fixed windows, attempts counted per window).
 * Deliberately not env-configurable: these are product decisions, not
 * deployment knobs — documented in AGENTS.md and the PAD security model.
 */
export const AUTH_RATE_LIMITS = {
  /** Sign-in per source IP: 10 attempts / 15 minutes. */
  signInIp: { limit: 10, windowMs: 15 * 60_000 } satisfies RateLimitPolicy,
  /** Sign-in per email: 10 attempts / 15 minutes (slow-drip guard across IPs). */
  signInEmail: { limit: 10, windowMs: 15 * 60_000 } satisfies RateLimitPolicy,
  /** Sign-up per source IP: 5 / hour (account-spam guard). */
  signUpIp: { limit: 5, windowMs: 60 * 60_000 } satisfies RateLimitPolicy,
  /** Reset requests per source IP: 5 / hour. */
  resetRequestIp: { limit: 5, windowMs: 60 * 60_000 } satisfies RateLimitPolicy,
  /** Reset requests per email: 3 / hour (token/mail flood guard). */
  resetRequestEmail: { limit: 3, windowMs: 60 * 60_000 } satisfies RateLimitPolicy,
  /** Reset-token consumption per source IP: 10 / hour (token brute-force guard). */
  resetPasswordIp: { limit: 10, windowMs: 60 * 60_000 } satisfies RateLimitPolicy,
} as const
