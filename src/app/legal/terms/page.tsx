import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The agreement between you and AURA Studio.',
}

const SECTIONS = [
  {
    title: 'The agreement',
    body: 'These terms govern your use of the AURA Studio site, memberships, and class bookings. By creating an account or booking a class you accept them. If you disagree with any part, please do not use the service.',
  },
  {
    title: 'Memberships',
    body: 'Memberships are billed monthly on the 1st, may be cancelled with 30 days\u2019 notice, and may be frozen for up to 60 days per calendar year at no charge. Prices shown are in US dollars and exclude applicable taxes.',
  },
  {
    title: 'Class packs',
    body: 'Class packs are single-purchase credits. They never expire, are non-refundable, and are not transferable between members. A pack credit is consumed when you book and is returned when you cancel within the cancellation window.',
  },
  {
    title: 'Booking and cancellation',
    body: 'Classes may be booked up to 7 days ahead by unlimited members and 5 days ahead by pack holders. You may cancel a booking yourself up to 2 hours before class start; later cancellations and no-shows forfeit the credit. If we cancel a class, every credit is automatically returned.',
  },
  {
    title: 'Conduct in the studio',
    body: 'AURA is a women-only space built on respect. Harassment, photography of other members without consent, or misuse of equipment is grounds for membership termination without refund of the current period.',
  },
  {
    title: 'Health and safety',
    body: 'You acknowledge the physical demands of exercise, confirm you are physically able to participate, and agree to follow instructor direction. AURA is not liable for injury arising from ignoring instruction or failing to disclose a relevant condition.',
  },
  {
    title: 'Changes to the terms',
    body: 'We may update these terms; material changes are emailed to members at least 14 days before taking effect. Continued use after the effective date constitutes acceptance.',
  },
] as const

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="solid" />
      <main className="flex-1 px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-5xl font-extralight italic tracking-tight text-primary md:text-6xl">
            Terms of service
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
