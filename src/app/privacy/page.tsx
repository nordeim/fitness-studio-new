import type { Metadata } from 'next'
import { LegalPage } from '@/components/site/legal-page'

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
    body: 'If we change this policy materially, we will notify account holders by email before the change takes effect. The effective date on this page always reflects the current version.',
  },
] as const

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" effective="January 2026" sections={SECTIONS} />
}
