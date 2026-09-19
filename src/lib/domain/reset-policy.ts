/**
 * Password-reset token policy — pure state machine over a snapshot of the
 * token row. Tokens are single-use and live exactly 1 hour; the consumed
 * marker dominates expiry (a used token is used, whatever the clock says).
 * The action layer owns all DB I/O; this module only decides.
 */

export type ResetTokenSnapshot =
  | { found: false }
  | { found: true; expiresAt: Date; usedAt: Date | null }

export type ResetTokenState = 'valid' | 'not_found' | 'expired' | 'used'

export function validateResetTokenState(snapshot: ResetTokenSnapshot, now: Date): ResetTokenState {
  if (!snapshot.found) return 'not_found'
  if (snapshot.usedAt !== null) return 'used'
  if (snapshot.expiresAt.getTime() <= now.getTime()) return 'expired'
  return 'valid'
}

/** Customer-safe copy for every non-valid state — uniform, no oracle. */
export const RESET_INVALID_MESSAGE = 'This reset link is invalid or has expired. Please request a new one.'
