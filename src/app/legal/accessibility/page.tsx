import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'AURA Studio\u2019s commitment to digital accessibility.',
}

const SECTIONS = [
  {
    title: 'Our commitment',
    body: 'AURA Studio believes strength belongs to everyone. We target WCAG 2.2 Level AA across this site and treat accessibility regressions as functional bugs, not cosmetic issues.',
  },
  {
    title: 'What we build for',
    body: 'Full keyboard operability with visible focus states; semantic landmarks (header, nav, main, footer) and heading order; color contrast of at least 4.5:1 for body text and 3:1 for large display text; form fields with real labels and error messages announced to screen readers; motion that respects the prefers-reduced-motion system setting; touch targets of at least 44 by 44 pixels.',
  },
  {
    title: 'Known limitations',
    body: 'The gallery is decorative imagery; where a photograph carries meaning we provide alternative text, and decorative images are hidden from assistive technology. The benefits carousel is fully keyboard-navigable but is not a live region — each card is readable in the accessibility tree.',
  },
  {
    title: 'Physical studio access',
    body: 'Our studio entrance, changing rooms, and main floor are step-free. Reformers accommodate seated transfer. For specific accommodations before your first visit, call 123-456-7890 or email info@mysite.com and a coach will plan the session with you.',
  },
  {
    title: 'Feedback',
    body: 'If you hit a barrier on this site, tell us: email info@mysite.com with the page and what happened. We triage accessibility reports within two business days and aim to fix confirmed WCAG failures within one release cycle.',
  },
] as const

export default function AccessibilityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="solid" />
      <main className="flex-1 px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-5xl font-extralight italic tracking-tight text-primary md:text-6xl">
            Accessibility statement
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Last reviewed January 2026
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
