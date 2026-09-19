import type { MetadataRoute } from 'next'
import { siteUrl } from './robots'

/**
 * Sitemap for the public, indexable surfaces. Auth-gated (/account) and
 * utility routes are intentionally absent; legal pages are included because
 * the source site links them from every footer.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/classes', '/pricing', '/instructors', '/privacy', '/terms', '/accessibility']

  return routes.map((route) => ({
    url: `${siteUrl()}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : route === '/classes' ? 0.9 : 0.7,
  }))
}
