import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How AURA Studio collects, uses, and protects your information.',
}

const SECTIONS = [
  {
    title: 'Information we collect',
    body: 'We collect the information you give us directly: your name, email address, and password (stored only as a salted hash) when you create an account, plus the classes you book and cancel. We also collect standard technical logs — request timestamps and error diagnostics — to keep the studio running.',
  },
  {
    title: 'How we use it',
    body: 'Your account information is used to authenticate you, hold your class reservations, and send transactional messages about your bookings (confirmations and cancellations). We do not sell, rent, or trade your personal information to anyone.',
  },
  {
    title: 'What we never do',
    body: 'We never store your password in readable form, never expose your email to other members, and never use your booking history for advertising. Passwords are hashed with scrypt and sessions use HMAC-fingerprinted opaque tokens.',
  },
  {
    title: 'Data retention',
    body: 'Account data is retained while your membership is active. Cancelled bookings are retained for accounting and dispute resolution. You may request deletion of your account and personal data at any time by emailing info@mysite.com — we complete verified requests within 30 days.',
  },
  {
    title: 'Cookies',
    body: 'We set one essential cookie: an httpOnly session cookie that keeps you signed in. It contains an opaque token, is inaccessible to JavaScript, and expires after 30 days. We do not use third-party tracking cookies.',
  },
  {
    title: 'Your rights',
    body: 'Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data, and to object to certain processing. Contact info@mysite.com and we will honor verified requests promptly.',
  },
  {
    title: 'Changes to this policy',
    body: 'If we change this policy materially, we will notify account holders by email before the change takes effect. The effective date below always reflects the current version.',
  },
] as const

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="solid" />
      <main className="flex-1 px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-5xl font-extralight italic tracking-tight text-primary md:text-6xl">
            Privacy policy
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Effective January 2026
          </p>
          <div className="mt-12 space-y-10">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="font-heading text-2xl font-light text-primary">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
