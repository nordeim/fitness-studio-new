import type { MetadataRoute } from 'next'

/** Canonical site origin — set SITE_URL in production; localhost in dev. */
export function siteUrl(): string {
  return process.env.SITE_URL ?? 'http://localhost:3000'
}

/**
 * robots.txt via the App Router metadata route (env-aware, unlike a static
 * file). Everything public is allowed; no disallow rules exist because the
 * auth-gated pages redirect anonymous visitors anyway.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
