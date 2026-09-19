import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { PrismaClient } from '@prisma/client'

import { resolveDatabaseUrl } from '@/lib/domain/database-url'

/**
 * True when the directory sits inside a Next.js build output tree — such a
 * `prisma/schema.prisma` is a *traced copy* (`output: "standalone"` copies the
 * schema to `.next/standalone/prisma/`), not the source of truth: anchoring
 * there would point the database inside `.next`, where every rebuild discards
 * it. POSIX-style paths only (the documented deploy targets are Linux/macOS).
 */
function isInsideBuildOutput(dir: string): boolean {
  return dir.split('/').includes('.next')
}

/**
 * Locate the directory that contains the project's `prisma/schema.prisma`.
 *
 * Why not just `process.cwd()`: the standalone production server runs its
 * render workers with the cwd set to `.next/standalone`, two levels below the
 * repo root — a cwd-anchored relative URL would point inside the build
 * output. Walking up a bounded number of parents (skipping traced copies
 * inside `.next`) finds the real schema directory in every supported runtime:
 *
 * - dev / `next build` workers: cwd IS the repo root (depth 0)
 * - standalone server, run in place: cwd is `<repo>/.next/standalone` — the
 *   traced `.next/standalone/prisma` copy is skipped, the real
 *   `<repo>/prisma` anchors the URL at `<repo>/db/custom.db`
 *   (where `db:push` / `migrate` / the seed put it — persistent across
 *   rebuilds)
 * - standalone tree relocated elsewhere (e.g. Docker `WORKDIR /app`): the
 *   traced `/app/prisma/schema.prisma` is no longer inside `.next` and anchors
 *   the database at `/app/db/custom.db` (mount it as a volume)
 *
 * Deployments that need full control can sidestep all of this by setting
 * `DATABASE_URL` to an absolute `file:` URL — absolute URLs pass through the
 * resolution untouched.
 */
function findSchemaDir(): string {
  let dir = process.cwd()
  for (let depth = 0; depth < 6; depth++) {
    if (existsSync(join(dir, 'prisma', 'schema.prisma')) && !isInsideBuildOutput(dir)) {
      return join(dir, 'prisma')
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  // No source schema found above the cwd (unusual layout) — keep the dev
  // semantics so Prisma fails loudly with its own "database not found" error.
  return join(process.cwd(), 'prisma')
}

/**
 * Singleton Prisma client — survives HMR reloads in dev without leaking handles.
 *
 * The datasource URL is resolved explicitly (pure logic in
 * `lib/domain/database-url`) because the Prisma CLI and the generated client
 * disagree about relative `file:` URLs: the CLI resolves them against
 * `prisma/schema.prisma` (where `db:push` / `migrate` / the seed put the
 * SQLite file), while the client's engine cwd falls back to the traced
 * `.prisma/client` directory in standalone builds — a path where no database
 * exists, failing every DB-backed route with "Unable to open the database
 * file". Anchoring at the real schema directory replicates the CLI's
 * semantics in every runtime; absolute and non-SQLite URLs pass through
 * untouched, so injected env (CI, containers) keeps working as-is.
 */
const datasourceUrl = resolveDatabaseUrl(process.env.DATABASE_URL, findSchemaDir())

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
