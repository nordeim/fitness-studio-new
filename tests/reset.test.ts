/**
 * Password-reset seams: token state policy and delivery-channel choice.
 * Pure modules, no DB / no network — the action layer orchestrates I/O.
 * Expected values are worked examples from the reset policy spec:
 * tokens are single-use, live exactly 1 hour, and the "used" marker
 * outlives expiry (a consumed token stays consumed).
 */
import { describe, expect, it } from 'vitest'
import { validateResetTokenState } from '../src/lib/domain/reset-policy'
import { chooseResetChannel, buildResetEmail } from '../src/lib/domain/reset-delivery'

const NOW = new Date('2026-09-19T12:00:00Z')
const LATER = new Date('2026-09-19T13:00:00Z') // exactly +1h
const EARLIER = new Date('2026-09-19T11:00:00Z')

describe('validateResetTokenState (reset policy)', () => {
  it('reports not_found when no token row exists', () => {
    expect(validateResetTokenState({ found: false }, NOW)).toBe('not_found')
  })

  it('accepts an unused token that has not reached its expiry', () => {
    expect(
      validateResetTokenState({ found: true, expiresAt: LATER, usedAt: null }, NOW),
    ).toBe('valid')
  })

  it('rejects a token at the exact instant of expiry (boundary is expired)', () => {
    expect(
      validateResetTokenState({ found: true, expiresAt: NOW, usedAt: null }, NOW),
    ).toBe('expired')
  })

  it('rejects a token past its expiry', () => {
    expect(
      validateResetTokenState({ found: true, expiresAt: EARLIER, usedAt: null }, NOW),
    ).toBe('expired')
  })

  it('rejects a consumed token even while nominally unexpired', () => {
    expect(
      validateResetTokenState(
        { found: true, expiresAt: LATER, usedAt: new Date('2026-09-19T12:30:00Z') },
        NOW,
      ),
    ).toBe('used')
  })

  it('a consumed token reports used even when also expired (use dominates)', () => {
    expect(
      validateResetTokenState(
        { found: true, expiresAt: EARLIER, usedAt: new Date('2026-09-19T11:30:00Z') },
        NOW,
      ),
    ).toBe('used')
  })
})

describe('chooseResetChannel (delivery decision)', () => {
  it('sends email when an API key is configured', () => {
    expect(chooseResetChannel(true)).toBe('email')
  })

  it('falls back to the operator log when no API key is configured', () => {
    expect(chooseResetChannel(false)).toBe('operator-log')
  })
})

describe('buildResetEmail (worked example)', () => {
  const url = 'http://localhost:3000/login?token=abc123'
  const email = buildResetEmail('queen@example.com', url)

  it('addresses the member and carries a stable subject', () => {
    expect(email.to).toBe('queen@example.com')
    expect(email.subject).toBe('Reset your AURA Studio password')
  })

  it('embeds the reset URL in both HTML and text bodies', () => {
    expect(email.html).toContain(url)
    expect(email.text).toContain(url)
  })

  it('never puts the token itself in the subject (preview-pane hygiene)', () => {
    expect(email.subject).not.toContain('abc123')
  })

  it('brands the HTML body and states the 1-hour validity', () => {
    expect(email.html).toContain('AURA Studio')
    expect(email.html).toContain('one hour')
  })
})
