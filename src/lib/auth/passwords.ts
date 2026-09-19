/**
 * Password hashing with Node's native scrypt — no external crypto deps.
 * Format: scrypt$N$r$p$saltB64$hashB64 (self-describing; parameters travel
 * with the hash so they can be raised later without invalidating old hashes).
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import { promisify } from 'node:util'

/**
 * promisify() collapses scrypt's overloads onto the first one (3 args), so the
 * options-carrying call below is a TS2554 at the call site. Pin the exact
 * signature we use: (password, salt, keylen, options) -> Promise<Buffer>.
 */
const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>

const N = 16384 // CPU/memory cost
const R = 8 // block size
const P = 1 // parallelization
const KEYLEN = 64

/**
 * A valid-format scrypt hash of a random throwaway password, used by the
 * sign-in action to equalize work when the account does not exist: verifying
 * against this costs the same scrypt effort as a real check, so response
 * timing never reveals whether an email has an account (the account-
 * existence oracle the uniform error copy already hides).
 */
export const DUMMY_PASSWORD_HASH =
  'scrypt$16384$8$1$qAKrl3yJHITwyaENWqe/Gw==$hDf1cVO25m4f7e2JqFjMUXk9aDux3QSy/+t7g5BGL89ZHAVrjskphQXXeEmGWOAGiiUJ/UXynryaCClhj5eC2w=='

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
