import type { Metadata } from 'next'
import { Taviraj, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// AURA type system: Taviraj (light serif display) + Inter (workhorse body).
const taviraj = Taviraj({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'AURA Studio — Strength Redefined',
    template: '%s | AURA Studio',
  },
  description:
    'A sanctuary for women who choose to be extraordinary. Boutique fitness classes, premium memberships, and a space to cultivate strength and serenity.',
  keywords: ['fitness studio', 'women fitness', 'yoga', 'HIIT', 'pilates', 'strength training'],
  icons: { icon: '/images/logo.png' },
  openGraph: {
    title: 'AURA Studio — Strength Redefined',
    description:
      'A sanctuary for women who choose to be extraordinary. Where every rep is a revolution and every class is a declaration.',
    siteName: 'AURA Studio',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${taviraj.variable} ${inter.variable} antialiased bg-background text-foreground font-body`}
      >
        {children}
        {/* sonner toaster — the toast() calls in the site components
            (schedule browser, booking rows, auth card) render here */}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
