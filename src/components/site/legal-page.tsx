import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'

export interface LegalSection {
  title: string
  body: string
}

/**
 * Shared legal page shell — measured from the source's legal pages:
 * a cream prose page (no espresso band), `max-w-3xl` centered column,
 * modest Taviraj h1 (`text-4xl md:text-5xl font-light`), then `space-y-10`
 * sections of h2 (`text-2xl font-light`) + body copy at `text-primary/80`.
 *
 * The source leaves its header transparent+white over the cream field
 * (the wordmark is invisible — the same platform bug as its 404); we pass
 * `forceSolid` so the chrome stays cream+espresso and the close control
 * remains visible. Legal copy itself is original (the source ships Base44
 * placeholder boilerplate) — a documented, accepted deviation.
 */
export function LegalPage({
  title,
  effective,
  sections,
}: {
  title: string
  effective?: string
  sections: readonly LegalSection[]
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader forceSolid />
      <main className="flex-1">
        <div className="bg-background pb-16 pt-24">
          <div className="mx-auto max-w-3xl px-6 md:px-[8vw]">
            <h1 className="mb-12 font-heading text-4xl font-light leading-tight text-primary md:text-5xl">
              {title}
            </h1>
            {effective && (
              <p className="-mt-10 mb-12 text-sm text-muted-foreground">
                Effective {effective}
              </p>
            )}
            <div className="space-y-10 font-body leading-relaxed text-primary/80">
              {sections.map((s) => (
                <section key={s.title}>
                  <h2 className="mb-4 font-heading text-2xl font-light text-primary">
                    {s.title}
                  </h2>
                  <p className="text-base leading-relaxed">{s.body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
