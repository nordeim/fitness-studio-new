import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/site/auth-card'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AURA Studio to book classes and manage your membership.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const user = await getCurrentUser()
  if (user) redirect('/account')

  const params = await searchParams
  const raw = typeof params.redirect === 'string' ? params.redirect : ''
  const safeTarget = raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\') ? raw : '/account'

  return (
    <div className="relative flex min-h-screen flex-col bg-primary">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/sky.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/80 to-primary" />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <AuthCard redirectTarget={safeTarget} />
      </main>
    </div>
  )
}
