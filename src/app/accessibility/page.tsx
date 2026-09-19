import type { Metadata } from 'next'
import { LegalPage } from '@/components/site/legal-page'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'AURA Studio\u2019s commitment to an accessible web experience.',
}

const SECTIONS = [
  {
    title: 'Our commitment',
    body: 'AURA Studio believes strength belongs to everyone. We target WCAG 2.2 Level AA across this site and treat accessibility regressions as functional bugs, not cosmetic issues.',
  },
  {
    title: 'What we build for',
    body: 'Full keyboard operability with visible focus states; semantic landmarks (header, nav, main, footer) and heading order; color contrast of at least 4.5:1 for body text and 3:1 for large display text; form fields with real labels and error messages announced to screen readers; motion that respects the prefers-reduced-motion system setting; touch targets of at least 44 by 44 pixels where layout allows.',
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
  return <LegalPage title="Accessibility Statement" sections={SECTIONS} />
}
