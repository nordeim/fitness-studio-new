/**
 * Password hashing with Node's native scrypt — no external crypto deps.
 * Format: scrypt$N$r$p$saltB64$hashB64 (self-describing; parameters travel
 * with the hash so they can be raised later without invalidating old hashes).
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb)

const N = 16384 // CPU/memory cost
const R = 8 // block size
const P = 1 // parallelization
const KEYLEN = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scrypt(password, salt, KEYLEN, { N, r: R, p: P })) as Buffer
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${derived.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, nRaw, rRaw, pRaw, saltB64, hashB64] = stored.split('$')
    if (scheme !== 'scrypt') return false
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(hashB64, 'base64')
    const derived = (await scrypt(password, salt, expected.length, {
      N: Number(nRaw),
      r: Number(rRaw),
      p: Number(pRaw),
    })) as Buffer
    return derived.length === expected.length && timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}
