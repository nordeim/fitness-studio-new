/**
 * SQLite datasource URL resolution — pure string logic, no I/O imports.
 *
 * Why this exists: the Prisma CLI resolves relative `file:` URLs against the
 * directory of `prisma/schema.prisma`, so the documented `file:../db/custom.db`
 * means `<repo>/db/custom.db` — that is where `db:push` / `migrate` / the seed
 * put the database. The generated Prisma client, however, resolves the same
 * relative URL against its engine cwd, and in a standalone production build
 * (`output: "standalone"`) that cwd falls back to the traced
 * `.next/standalone/node_modules/.prisma/client` directory — a path no
 * database will ever occupy. Every DB-backed route then fails with
 * PrismaClientInitializationError ("Unable to open the database file").
 *
 * `resolveDatabaseUrl` restores the CLI's schema-relative semantics for every
 * runtime — dev server, build workers, and the standalone server alike — by
 * resolving the URL against the schema directory before it is handed to
 * PrismaClient as an explicit `datasourceUrl`. Absolute URLs and non-SQLite
 * URLs pass through untouched, so injected absolute `DATABASE_URL`s (CI,
 * containers) keep working without a rewrite.
 */

/** The repo's documented SQLite location (see .env.example / README). */
export const DEFAULT_DATABASE_URL = 'file:../db/custom.db'

/**
 * Join a relative POSIX path onto an absolute anchor, collapsing `.` and `..`
 * segments lexically and clamping at the filesystem root — the same result
 * `path.resolve(anchor, relative)` would produce, implemented as pure string
 * logic so the module stays import-free (the lib/domain purity invariant).
 */
function resolvePosix(anchor: string, relative: string): string {
  const stack = anchor.split('/').filter((segment) => segment.length > 0)
  for (const segment of relative.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      // POSIX resolve clamps at the root: popping the last segment stays at "/".
      if (stack.length > 0) stack.pop()
      continue
    }
    stack.push(segment)
  }
  return `/${stack.join('/')}`
}

/**
 * Resolve a datasource URL for PrismaClient's `datasourceUrl` option.
 *
 * - `undefined` / blank input falls back to `fallbackUrl` (by default the
 *   repo's documented `file:../db/custom.db`).
 * - Non-`file:` URLs (postgresql://, mysql://, …) pass through unchanged.
 * - Absolute `file:/…` URLs pass through unchanged (injected env / containers).
 * - Relative `file:` URLs resolve against `schemaDir` — the directory that
 *   contains `prisma/schema.prisma` — replicating the Prisma CLI's
 *   schema-relative semantics (`file:../db/custom.db` + `<repo>/prisma`
 *   → `<repo>/db/custom.db`).
 * - A bare `file:` with no path passes through so Prisma rejects it with its
 *   own descriptive error instead of silently pointing at a directory.
 *
 * POSIX-style URLs only (the documented deploy targets are Linux/macOS).
 */
export function resolveDatabaseUrl(
  url: string | undefined,
  schemaDir: string,
  fallbackUrl: string = DEFAULT_DATABASE_URL
): string {
  const raw = url?.trim().length ? url.trim() : fallbackUrl
  if (!raw.startsWith('file:')) return raw

  const filePath = raw.slice('file:'.length)
  if (filePath.length === 0) return raw
  if (filePath.startsWith('/')) return raw

  return `file:${resolvePosix(schemaDir, filePath)}`
}
