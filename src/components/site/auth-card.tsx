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
  resetPasswordAction,
} from '@/actions/auth'

type Mode = 'signin' | 'signup' | 'reset' | 'newpass'

/**
 * Auth card: sign-in / sign-up / password-reset states in one shell,
 * matching the source app's flow (email+password, Google placeholder
 * replaced by an honest "coming soon" note since no OAuth provider is
 * configured in this deployment).
 */
export function AuthCard({
  redirectTarget,
  initialResetToken = '',
}: {
  redirectTarget: string
  initialResetToken?: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialResetToken ? 'newpass' : 'signin')
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
    } else if (mode === 'newpass') {
      result = await resetPasswordAction(formData)
    } else {
      result = await requestPasswordResetAction(formData)
    }

    if (result.ok) {
      if (mode === 'reset') {
        toast.success('If an account exists for that email, a reset link is on its way.')
        switchMode('signin')
      } else if (mode === 'newpass') {
        toast.success('Password updated. Sign in with your new password.')
        router.replace('/login')
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
        {mode === 'newpass' && (
          <h1 className="font-heading mt-6 text-4xl font-extralight italic text-primary-foreground">
            Choose a new password
          </h1>
        )}
        <p className="mt-3 text-sm text-primary-foreground/60">
          {mode === 'signin' && 'Sign in to continue your journey'}
          {mode === 'signup' && 'Your first week is on us'}
          {mode === 'reset' && 'We\u2019ll send you a reset link'}
          {mode === 'newpass' && 'Your reset link is valid for one hour'}
        </p>
      </div>

      <div className="rounded-2xl bg-background p-8 shadow-xl md:p-10">
        {mode === 'reset' && (
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Enter the email tied to your membership and we&apos;ll send a reset link.
          </p>
        )}
        {mode === 'newpass' && (
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Pick the next password carefully — after this, your other devices will
            be signed out for safety.
          </p>
        )}

        {mode !== 'reset' && mode !== 'newpass' && (
          <>
            {/* Google sign-in — present for parity with the source flow;
                no OAuth provider is wired in this deployment, so it explains
                itself honestly instead of failing silently. */}
            <button
              type="button"
              onClick={() =>
                toast.info('Google sign-in arrives with our next release — use email for now.')
              }
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-5 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            <div className="my-6 flex items-center gap-4" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form action={handleSubmit} className="space-y-5" noValidate>
          {mode === 'newpass' && <input type="hidden" name="token" value={initialResetToken} />}
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

          {mode !== 'newpass' && (
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
          )}

          {mode !== 'reset' && (
            <div>
              <label htmlFor="auth-password" className={labelClasses}>
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'signup' || mode === 'newpass' ? 8 : undefined}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                className={inputClasses}
                placeholder={mode === 'signup' || mode === 'newpass' ? 'At least 8 characters' : '••••••••'}
              />
              {fieldErrors.password && (
                <p id="auth-password-error" className={errorClasses} role="alert">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>
          )}

          {(mode === 'signup' || mode === 'newpass') && (
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
                  : mode === 'newpass'
                    ? 'Update password'
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
          {(mode === 'reset' || mode === 'newpass') && (
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
            Sessions are secured with hashed passwords and signed cookies.
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
