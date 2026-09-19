/**
 * 404 copy — measured from the source app's platform NotFound screen:
 * `The page "does-not-exist" could not be found in this application.`
 * The source displays the offending pathname WITHOUT its leading slash
 * (verified live for both `/does-not-exist` and `/foo/bar`).
 * Pure string formatting; no I/O.
 */

/** Formats the offending pathname into the source 404 sentence. */
export function formatNotFoundCopy(path: string): string {
  const display = path.replace(/^\//, '')
  return `The page "${display}" could not be found in this application.`
}
