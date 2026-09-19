/**
 * SQLite URL resolution at the datasource seam.
 *
 * The Prisma CLI resolves relative `file:` URLs against the directory of
 * `prisma/schema.prisma` (so `file:../db/custom.db` means `<repo>/db/custom.db`).
 * The generated client, however, resolves them against its OWN engine cwd —
 * which falls back to the traced `.prisma/client` directory in a standalone
 * build (`output: "standalone"`), pointing at a path where no database ever
 * exists. `resolveDatabaseUrl` restores the CLI's schema-relative semantics
 * for every runtime (dev, build workers, standalone server) by resolving the
 * URL against the schema directory before it reaches PrismaClient.
 *
 * Expected values are worked examples — never recomputed by the same code
 * under test.
 */
import { describe, expect, it } from 'vitest'
import { resolveDatabaseUrl } from '../src/lib/domain/database-url'

// The anchor the app passes: the directory containing schema.prisma, with the
// process running from the repo root (the documented dev/start workflow).
const SCHEMA_DIR = '/srv/aura/prisma'

describe('resolveDatabaseUrl (relative file: URLs resolve against the schema dir)', () => {
  it('resolves the default .env URL the way the Prisma CLI does', () => {
    // prisma/schema.prisma + ../db/custom.db -> <repo>/db/custom.db
    expect(resolveDatabaseUrl('file:../db/custom.db', SCHEMA_DIR)).toBe(
      'file:/srv/aura/db/custom.db'
    )
  })

  it('resolves a bare relative path inside the schema dir', () => {
    expect(resolveDatabaseUrl('file:db/ci.db', SCHEMA_DIR)).toBe(
      'file:/srv/aura/prisma/db/ci.db'
    )
  })

  it('resolves an explicit ./ prefix', () => {
    expect(resolveDatabaseUrl('file:./dev.db', SCHEMA_DIR)).toBe(
      'file:/srv/aura/prisma/dev.db'
    )
  })

  it('collapses multiple parent hops and stray slashes', () => {
    // prisma is nested at packages/app/prisma: ../.. climbs to packages,
    // so db lands beside it — worked example via path.resolve semantics.
    expect(resolveDatabaseUrl('file:../../db//shared.db', '/srv/aura/packages/app/prisma')).toBe(
      'file:/srv/aura/packages/db/shared.db'
    )
  })

  it('clamps runaway .. segments at the filesystem root (POSIX resolve semantics)', () => {
    expect(resolveDatabaseUrl('file:../../../../escape.db', SCHEMA_DIR)).toBe(
      'file:/escape.db'
    )
  })
})

describe('resolveDatabaseUrl (passthrough cases)', () => {
  it('passes absolute file: URLs through unchanged', () => {
    // e.g. an injected DATABASE_URL=file:/home/z/project/db/custom.db
    expect(resolveDatabaseUrl('file:/home/z/project/db/custom.db', SCHEMA_DIR)).toBe(
      'file:/home/z/project/db/custom.db'
    )
  })

  it('passes non-SQLite URLs through unchanged', () => {
    expect(resolveDatabaseUrl('postgresql://user:pw@host:5432/aura', SCHEMA_DIR)).toBe(
      'postgresql://user:pw@host:5432/aura'
    )
  })

  it('returns the resolved fallback when the input is missing or blank', () => {
    expect(resolveDatabaseUrl(undefined, SCHEMA_DIR)).toBe('file:/srv/aura/db/custom.db')
    expect(resolveDatabaseUrl('', SCHEMA_DIR)).toBe('file:/srv/aura/db/custom.db')
    expect(resolveDatabaseUrl('   ', SCHEMA_DIR)).toBe('file:/srv/aura/db/custom.db')
  })

  it('honours a custom fallback URL', () => {
    expect(resolveDatabaseUrl(undefined, SCHEMA_DIR, 'file:./ci.db')).toBe(
      'file:/srv/aura/prisma/ci.db'
    )
  })
})

describe('resolveDatabaseUrl (malformed input stays loud, not silently rewritten)', () => {
  it('passes an empty file: URL through so Prisma rejects it with its own error', () => {
    expect(resolveDatabaseUrl('file:', SCHEMA_DIR)).toBe('file:')
  })

  it('trims surrounding whitespace before classifying', () => {
    expect(resolveDatabaseUrl('  file:../db/custom.db  ', SCHEMA_DIR)).toBe(
      'file:/srv/aura/db/custom.db'
    )
  })
})
