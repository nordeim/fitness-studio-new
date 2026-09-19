/**
 * ActionResult — the single mutation-result contract crossing the client
 * boundary (scandihaven invariant: server actions never throw across the
 * wire; they return a discriminated union).
 */
export type FieldErrors = Record<string, string[]>

export interface ActionError {
  code: ActionErrorCode
  message: string // customer-safe copy
  fieldErrors?: FieldErrors
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError }

export type ActionErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'CAPACITY_FULL'
  | 'RATE_LIMITED'
  | 'INTERNAL'

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data })

export const err = (
  code: ActionErrorCode,
  message: string,
  fieldErrors?: FieldErrors,
): ActionResult<never> => ({ ok: false, error: { code, message, fieldErrors } })

/**
 * Wrap a throwing action body into the ActionResult contract. Operator-level
 * detail is logged server-side only; the client receives customer-safe copy.
 */
export async function withResult<T>(
  fn: () => Promise<ActionResult<T>>,
  context: string,
): Promise<ActionResult<T>> {
  try {
    return await fn()
  } catch (error) {
    // Never leak internals to the client.
    console.error(`[action:${context}]`, error)
    return err('INTERNAL', 'Something went wrong on our side. Please try again.')
  }
}
