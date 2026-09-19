import type { Metadata } from 'next'
import Image from 'next/image'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { db } from '@/lib/db'
import { parseJsonArray } from '@/lib/domain/booking-rules'

export const metadata: Metadata = {
  title: 'Our Instructors',
  description:
    'Every coach at AURA brings a unique voice, years of mastery, and an unwavering belief in your potential.',
}

/**
 * Instructors — the source page renders an espresso hero band, the intro
 * line, and the "Our Philosophy" block in a narrow measure. The roster below
 * is the clone's seeded data (the source's collection is empty), styled with
 * the coach-panel gradient from the home accordion.
 */
export default async function InstructorsPage() {
  const instructors = await db.instructor.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Espresso hero band */}
        <section className="bg-primary px-6 pb-20 pt-36 text-primary-foreground md:px-[8vw] md:pb-28 md:pt-44">
          <div className="max-w-[1400px]">
            <h1 className="font-heading text-5xl font-light leading-tight md:text-7xl">
              Our instructors
            </h1>
            <p className="mt-6 max-w-md font-body text-sm leading-relaxed opacity-70 md:text-base">
              Every coach at AURA brings a unique voice, years of mastery, and an unwavering
              belief in your potential.
            </p>
          </div>
        </section>

        {/* Philosophy — narrow measure, like the source */}
        <section aria-labelledby="philosophy" className="px-6 py-16 md:px-[8vw] md:py-24">
          <div className="max-w-[1400px]">
            <div className="max-w-3xl">
              <p className="kicker mb-4 text-primary">Our philosophy</p>
              <h2
                id="philosophy"
                className="font-heading mb-6 text-2xl font-light leading-tight tracking-tight text-primary md:text-4xl"
              >
                We don&apos;t just train bodies. We ignite spirits.
              </h2>
              <p className="text-sm leading-relaxed text-primary md:text-base">
                At AURA, our instructors are more than coaches they are mentors, motivators, and
                fellow warriors on the path to excellence. Each brings a unique perspective shaped
                by diverse disciplines, real-world experience, and a deep commitment to every woman
                who walks through our doors. We believe that the best instructor is one who sees
                your potential before you do, and refuses to let you settle for less.
              </p>
            </div>
          </div>
        </section>

        {/* Roster (seeded — the source lists none) */}
        <section
          aria-label="Instructor roster"
          className="grid gap-10 px-6 pb-24 md:grid-cols-2 md:px-[8vw] md:pb-32"
        >
          {instructors.map((instr) => {
            const specialties = parseJsonArray(instr.specialties)
            const certifications = parseJsonArray(instr.certifications)
            return (
              <article
                key={instr.id}
                id={instr.id}
                className="group scroll-mt-28 overflow-hidden rounded-2xl border border-border/50 bg-background"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={instr.imageUrl}
                    alt={instr.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="coach-panel p-6 md:p-8">
                  <h3 className="font-heading text-[28px] font-light leading-tight text-primary">
                    {instr.name}
                  </h3>
                  <p className="mb-4 mt-1 text-xs uppercase tracking-[0.1em] text-primary">
                    {instr.title}
                  </p>
                  <p className="font-body text-sm leading-relaxed text-primary/70">
                    {instr.bio}
                  </p>
                  {instr.philosophy && (
                    <p className="mt-4 text-sm leading-relaxed text-primary/70">
                      {instr.philosophy}
                    </p>
                  )}
                  {specialties.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-xs uppercase tracking-[0.2em] text-primary/50">
                        Specialties
                      </h4>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {specialties.map((s) => (
                          <li
                            key={s}
                            className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-primary/80"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {certifications.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-xs uppercase tracking-[0.2em] text-primary/50">
                        Certifications
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-primary/70">
                        {certifications.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
