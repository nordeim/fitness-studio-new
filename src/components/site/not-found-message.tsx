'use client'

import { usePathname } from 'next/navigation'
import { formatNotFoundCopy } from '@/lib/domain/not-found'

/**
 * The source 404 quotes the offending path:
 * `The page "/does-not-exist" could not be found in this application.`
 * The pathname is only available client-side, so this is a tiny client
 * leaf inside the server-rendered not-found boundary.
 */
export function NotFoundMessage() {
  const pathname = usePathname()
  return (
    <p className="text-sm leading-relaxed text-slate-600">
      {formatNotFoundCopy(pathname)}
    </p>
  )
}
