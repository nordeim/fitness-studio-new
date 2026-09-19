import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'

export interface LegalSection {
  title: string
  body: string
}

/**
 * Shared legal page shell — espresso band with the "A legal disclaimer"
 * kicker (the source's page header), then the numbered prose sections in a
 * narrow measure on cream.
 */
export function LegalPage({
  title,
  kicker = 'A legal disclaimer',
  effective,
  sections,
}: {
  title: string
  kicker?: string
  effective?: string
  sections: readonly LegalSection[]
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary px-6 pb-20 pt-36 text-primary-foreground md:px-[8vw] md:pb-28 md:pt-44">
          <div className="max-w-[1400px]">
            <p className="kicker mb-4 opacity-60">{kicker}</p>
            <h1 className="font-heading text-5xl font-light leading-tight md:text-7xl">
              {title}
            </h1>
            {effective && (
              <p className="mt-6 font-body text-sm opacity-70">Effective {effective}</p>
            )}
          </div>
        </section>
        <section className="px-6 py-16 md:px-[8vw] md:py-24">
          <div className="mx-auto max-w-3xl space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-heading text-2xl font-light text-primary md:text-3xl">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
