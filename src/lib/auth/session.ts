/**
 * Opaque session tokens: random 32-byte secret, HMAC-SHA256 fingerprint stored
 * in the DB (a leaked DB row cannot be replayed as a cookie), httpOnly cookie
 * transport. Sessions expire and are swept lazily on read.
 */
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'aura_session'
const SESSION_TTL_DAYS = 30

function sessionSecret(): string {
  // Falls back to a derived dev secret so the app boots without config; set
  // SESSION_SECRET in production.
  return process.env.SESSION_SECRET ?? 'aura-dev-only-secret-set-SESSION_SECRET'
}

export function hashToken(token: string): string {
  return createHash('sha256').update(`${token}${sessionSecret()}`).digest('hex')
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 3_600_000)
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } })
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })
}

export interface CurrentUser {
  id: string
  email: string
  name: string | null
  role: string
}

/** Resolve the signed-in member, or null. Sweeps expired sessions opportunistically. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })

  if (!session) return null

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => undefined)
  }
  jar.delete(SESSION_COOKIE)
}
