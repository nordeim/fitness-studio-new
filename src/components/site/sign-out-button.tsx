'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/actions/auth'

export function SignOutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const signOut = async () => {
    await signOutAction()
    startTransition(() => {
      router.push('/')
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isPending}
      className="text-xs font-medium uppercase tracking-[0.2em] text-primary/70 underline-offset-4 transition-colors hover:text-primary hover:underline disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
