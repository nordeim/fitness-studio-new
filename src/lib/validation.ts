/**
 * Zod schemas for every mutation input — the server action layer validates
 * here before touching the database.
 */
import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .email('Enter a valid email address')
  .transform((v) => v.toLowerCase())

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name is too long'),
  email,
  password,
})

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const resetRequestSchema = z.object({ email })

export const bookingSchema = z.object({
  classId: z.string().trim().min(1),
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().trim().min(1),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

/** Flatten a ZodError into the fieldErrors shape used by ActionResult. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_form'
    out[key] = [...(out[key] ?? []), issue.message]
  }
  return out
}
