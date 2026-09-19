'use server'

/**
 * Auth server actions. Every action returns ActionResult — never throws
 * across the client boundary (the scandihaven invariant).
 */
import { randomBytes } from 'node:crypto'
import { db } from '@/lib/db'
import { err, ok, withResult, type ActionResult } from '@/lib/result'
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session'
import { hashPassword, verifyPassword } from '@/lib/auth/passwords'
import {
  signInSchema,
  signUpSchema,
  resetRequestSchema,
  toFieldErrors,
} from '@/lib/validation'

/**
 * Open-redirect guard: only same-origin relative paths starting with "/" but
 * not "//" or "/\\" (protocol-relative / scheme-relative escapes).
 * Not exported — kept local so this 'use server' module only exposes actions.
 */
function safeRedirect(target: FormDataEntryValue | null | undefined): string {
  const raw = typeof target === 'string' ? target : ''
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')) return raw
  return '/'
}

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

    const user = await db.user.findUnique({ where: { email: parsed.data.email } })
    const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false
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
 * Password reset request. No SMTP in this environment: the reset token is
 * logged server-side (operator channel) and the client gets a generic
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
    const user = await db.user.findUnique({ where: { email: parsed.data.email } })
    if (user) {
      const token = randomBytes(32).toString('base64url')
      const expiresAt = new Date(Date.now() + 3_600_000)
      await db.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })
      console.info(`[password-reset] token for ${user.email} (expires ${expiresAt.toISOString()}): ${token}`)
    }
    return ok({ delivered: true })
  }, 'requestPasswordReset')
}

