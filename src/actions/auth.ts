'use server'

/**
 * Auth server actions. Every action returns ActionResult — never throws
 * across the client boundary (the scandihaven invariant).
 */
import { randomBytes } from 'node:crypto'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { err, ok, withResult, type ActionResult } from '@/lib/result'
import { createSession, destroySession } from '@/lib/auth/session'
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '@/lib/auth/passwords'
import { validateResetTokenState, RESET_INVALID_MESSAGE } from '@/lib/domain/reset-policy'
import { chooseResetChannel, buildResetEmail } from '@/lib/domain/reset-delivery'
import { formatRetryAfter } from '@/lib/domain/rate-limit'
import { AUTH_RATE_LIMITS, clientIp, consumeRateLimit } from '@/lib/rate-limit-store'
import {
  signInSchema,
  signUpSchema,
  resetRequestSchema,
  resetPasswordSchema,
  toFieldErrors,
} from '@/lib/validation'

export async function signUpAction(formData: FormData): Promise<ActionResult<{ email: string }>> {
  return withResult(async () => {
    const parsed = signUpSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      return err('VALIDATION', 'Please fix the highlighted fields.', toFieldErrors(parsed.error))
    }

    const limited = consumeRateLimit(`signup:ip:${await clientIp()}`, AUTH_RATE_LIMITS.signUpIp)
    if (!limited.allowed) {
      return err('RATE_LIMITED', `Too many attempts to create an account. ${formatRetryAfter(limited.retryAfterMs)}`)
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
    if (existing) {
      return err('CONFLICT', 'An account with this email already exists. Try signing in instead.', {
        email: ['An account with this email already exists'],
      })
    }

    const passwordHash = await hashPassword(parsed.data.password)
    const user = await db.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
    })
    await createSession(user.id)
    return ok({ email: user.email })
  }, 'signUp')
}

export async function signInAction(formData: FormData): Promise<ActionResult<{ email: string }>> {
  return withResult(async () => {
    const parsed = signInSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      return err('VALIDATION', 'Please fix the highlighted fields.', toFieldErrors(parsed.error))
    }

    const ip = await clientIp()
    const ipLimited = consumeRateLimit(`signin:ip:${ip}`, AUTH_RATE_LIMITS.signInIp)
    if (!ipLimited.allowed) {
      return err('RATE_LIMITED', `Too many sign-in attempts. ${formatRetryAfter(ipLimited.retryAfterMs)}`)
    }
    const emailLimited = consumeRateLimit(
      `signin:email:${parsed.data.email}`,
      AUTH_RATE_LIMITS.signInEmail,
    )
    if (!emailLimited.allowed) {
      return err('RATE_LIMITED', `Too many sign-in attempts. ${formatRetryAfter(emailLimited.retryAfterMs)}`)
    }

    const user = await db.user.findUnique({ where: { email: parsed.data.email } })
    // Constant-work verify: a missing account burns the same scrypt effort as
    // a real one, so response timing never reveals which emails have accounts.
    const valid = await verifyPassword(
      parsed.data.password,
      user ? user.passwordHash : DUMMY_PASSWORD_HASH,
    )
    if (!user || !valid) {
      // Uniform message — never reveal which half was wrong.
      return err('NOT_FOUND', 'Invalid email or password.')
    }

    await createSession(user.id)
    return ok({ email: user.email })
  }, 'signIn')
}

export async function signOutAction(): Promise<ActionResult<undefined>> {
  return withResult(async () => {
    await destroySession()
    return ok(undefined)
  }, 'signOut')
}

/**
 * Request origin for reset links (proto + host), so links work on any
 * deployment without configuration. Falls back to SITE_URL when headers
 * are absent (never in a request context, but stay total).
 */
async function requestOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return process.env.SITE_URL ?? 'http://localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/**
 * Send a reset email through Resend. Failures are logged and swallowed:
 * the client must see the same generic confirmation either way (no
 * account-existence oracle, no crash on a mail-provider outage).
 */
async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const message = buildResetEmail(to, resetUrl)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.AURA_EMAIL_FROM ?? 'AURA Studio <onboarding@resend.dev>',
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    })
    if (!response.ok) {
      console.error(`[password-reset] email delivery failed: ${response.status} ${await response.text()}`)
    }
  } catch (error) {
    console.error('[password-reset] email delivery threw:', error)
  }
}

/**
 * Password reset request. Delivery follows the channel decision: email via
 * Resend when RESEND_API_KEY is configured, otherwise the token is logged
 * server-side (operator channel — the dev setup). The client gets a generic
 * "if the account exists" confirmation — never an account-existence oracle.
 */
export async function requestPasswordResetAction(
  formData: FormData,
): Promise<ActionResult<{ delivered: true }>> {
  return withResult(async () => {
    const parsed = resetRequestSchema.safeParse({ email: formData.get('email') })
    if (!parsed.success) {
      return err('VALIDATION', 'Please fix the highlighted fields.', toFieldErrors(parsed.error))
    }

    const ipLimited = consumeRateLimit(`resetreq:ip:${await clientIp()}`, AUTH_RATE_LIMITS.resetRequestIp)
    if (!ipLimited.allowed) {
      return err('RATE_LIMITED', `Too many reset requests. ${formatRetryAfter(ipLimited.retryAfterMs)}`)
    }
    const emailLimited = consumeRateLimit(
      `resetreq:email:${parsed.data.email}`,
      AUTH_RATE_LIMITS.resetRequestEmail,
    )
    if (!emailLimited.allowed) {
      return err('RATE_LIMITED', `Too many reset requests. ${formatRetryAfter(emailLimited.retryAfterMs)}`)
    }

    const user = await db.user.findUnique({ where: { email: parsed.data.email } })
    if (user) {
      const token = randomBytes(32).toString('base64url')
      const expiresAt = new Date(Date.now() + 3_600_000)
      await db.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })
      const resetUrl = `${await requestOrigin()}/login?token=${token}`
      if (chooseResetChannel(Boolean(process.env.RESEND_API_KEY)) === 'email') {
        await sendResetEmail(user.email, resetUrl)
      } else {
        console.info(
          `[password-reset] link for ${user.email} (expires ${expiresAt.toISOString()}): ${resetUrl}`,
        )
      }
    }
    return ok({ delivered: true })
  }, 'requestPasswordReset')
}

/**
 * Consume a reset token and set the new password. One transaction: mark the
 * token used, rehash the password, and revoke every session for the member
 * (a password reset invalidates other devices — standard hygiene). The
 * uniform error copy never reveals whether the token existed.
 */
export async function resetPasswordAction(
  formData: FormData,
): Promise<ActionResult<{ reset: true }>> {
  return withResult(async () => {
    const parsed = resetPasswordSchema.safeParse({
      token: formData.get('token'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      return err('VALIDATION', 'Please fix the highlighted fields.', toFieldErrors(parsed.error))
    }

    const limited = consumeRateLimit(`resetpass:ip:${await clientIp()}`, AUTH_RATE_LIMITS.resetPasswordIp)
    if (!limited.allowed) {
      return err('RATE_LIMITED', `Too many attempts. ${formatRetryAfter(limited.retryAfterMs)}`)
    }

    const row = await db.passwordResetToken.findUnique({ where: { token: parsed.data.token } })
    const state = validateResetTokenState(
      row ? { found: true, expiresAt: row.expiresAt, usedAt: row.usedAt } : { found: false },
      new Date(),
    )
    if (state !== 'valid' || !row) {
      return err('NOT_FOUND', RESET_INVALID_MESSAGE)
    }

    const passwordHash = await hashPassword(parsed.data.password)
    await db.$transaction([
      db.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      db.session.deleteMany({ where: { userId: row.userId } }),
    ])
    return ok({ reset: true })
  }, 'resetPassword')
}

