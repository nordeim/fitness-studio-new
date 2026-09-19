'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  signUpAction,
  signInAction,
  requestPasswordResetAction,
  signOutAction,
} from '@/actions/auth'

type Mode = 'signin' | 'signup' | 'reset'

/**
 * Auth card: sign-in / sign-up / password-reset states in one shell,
 * matching the source app's flow (email+password, Google placeholder
 * replaced by an honest "coming soon" note since no OAuth provider is
 * configured in this deployment).
 */
export function AuthCard({ redirectTarget }: { redirectTarget: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const switchMode = (next: Mode) => {
    setMode(next)
    setFieldErrors({})
  }

  const handleSubmit = async (formData: FormData) => {
    setFieldErrors({})
    let result: { ok: boolean; error?: { message: string; fieldErrors?: Record<string, string[]> } }

    if (mode === 'signin') {
      result = await signInAction(formData)
    } else if (mode === 'signup') {
      result = await signUpAction(formData)
    } else {
      result = await requestPasswordResetAction(formData)
    }

    if (result.ok) {
      if (mode === 'reset') {
        toast.success('If an account exists for that email, a reset link is on its way.')
        switchMode('signin')
      } else {
        toast.success(mode === 'signup' ? 'Welcome to AURA.' : 'Welcome back.')
        startTransition(() => router.push(redirectTarget))
        router.refresh()
      }
    } else {
      const e = result.error
      if (!e) return
      setFieldErrors(e.fieldErrors ?? {})
      toast.error(e.message)
    }
  }

  const inputClasses =
    'min-h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
  const labelClasses = 'mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-primary/70'
  const errorClasses = 'mt-1.5 text-xs text-destructive'

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/images/logo.png"
          alt="AURA Studio logo"
          width={56}
          height={56}
          className="rounded-full"
        />
        {mode === 'signin' && (
          <h1 className="font-heading mt-6 text-4xl font-extralight italic text-primary-foreground">
            Welcome back to AURA
          </h1>
        )}
        {mode === 'signup' && (
          <h1 className="font-heading mt-6 text-4xl font-extralight italic text-primary-foreground">
            Create your account
          </h1>
        )}
        {mode === 'reset' && (
          <h1 className="font-heading mt-6 text-4xl font-extralight italic text-primary-foreground">
            Reset your password
          </h1>
        )}
        <p className="mt-3 text-sm text-primary-foreground/60">
          {mode === 'signin' && 'Sign in to continue your journey'}
          {mode === 'signup' && 'Your first week is on us'}
          {mode === 'reset' && 'We\u2019ll send you a reset link'}
        </p>
      </div>

      <div className="rounded-2xl bg-background p-8 shadow-xl md:p-10">
        {mode === 'reset' && (
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Enter the email tied to your membership and we&apos;ll send a reset link.
          </p>
        )}

        <form action={handleSubmit} className="space-y-5" noValidate>
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className={labelClasses}>
                Name
              </label>
              <input
                id="auth-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined}
                className={inputClasses}
                placeholder="Jordan King"
              />
              {fieldErrors.name && (
                <p id="auth-name-error" className={errorClasses} role="alert">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className={labelClasses}>
              Email
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
              className={inputClasses}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p id="auth-email-error" className={errorClasses} role="alert">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="auth-password" className={labelClasses}>
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={mode === 'signup' ? 8 : undefined}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                className={inputClasses}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              />
              {fieldErrors.password && (
                <p id="auth-password-error" className={errorClasses} role="alert">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-confirm" className={labelClasses}>
                Confirm password
              </label>
              <input
                id="auth-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={inputClasses}
                placeholder="Once more, with feeling"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 w-full bg-primary py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {isPending
              ? 'One moment…'
              : mode === 'signin'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          {mode === 'signin' && (
            <>
              <p>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </p>
              <p className="text-muted-foreground">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-muted-foreground">
              Already a member?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p className="text-muted-foreground">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to sign in
              </button>
            </p>
          )}
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Prefer social sign-in? Google sign-in arrives with our next release.
          </p>
        </div>
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 transition-colors hover:text-accent"
        >
          Back to the studio
        </Link>
      </p>
    </div>
  )
}
