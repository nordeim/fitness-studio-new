/**
 * 404 copy — measured from the source app's platform NotFound screen:
 * `The page "/does-not-exist" could not be found in this application.`
 * Pure string formatting; no I/O.
 */

/** Formats the offending pathname into the source 404 sentence. */
export function formatNotFoundCopy(path: string): string {
  return `The page "${path}" could not be found in this application.`
}
