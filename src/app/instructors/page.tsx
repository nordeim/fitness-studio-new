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

export default async function InstructorsPage() {
  const instructors = await db.instructor.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="solid" />
      <main className="flex-1 px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-5xl font-extralight italic tracking-tight text-primary md:text-7xl">
            Our instructors
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Every coach at AURA brings a unique voice, years of mastery, and an unwavering belief
            in your potential.
          </p>

          {/* Philosophy */}
          <section aria-labelledby="philosophy" className="mt-16">
            <p className="kicker text-primary/60">Our philosophy</p>
            <h2
              id="philosophy"
              className="font-heading mt-4 max-w-2xl text-4xl font-extralight italic leading-tight tracking-tight text-primary md:text-5xl"
            >
              We don&apos;t just train bodies. We ignite spirits.
            </h2>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              At AURA, our instructors are more than coaches — they are mentors, motivators, and
              fellow warriors on the path to excellence. Each brings a unique perspective shaped
              by diverse disciplines, real-world experience, and a deep commitment to every woman
              who walks through our doors. We believe that the best instructor is one who sees
              your potential before you do, and refuses to let you settle for less.
            </p>
          </section>

          {/* Instructor cards */}
          <section aria-label="Instructor roster" className="mt-16 grid gap-10 md:grid-cols-2">
            {instructors.map((instr) => {
              const specialties = parseJsonArray(instr.specialties)
              const certifications = parseJsonArray(instr.certifications)
              return (
                <article
                  key={instr.id}
                  id={instr.id}
                  className="group scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <div className="relative aspect-[4/5] md:aspect-[16/11]">
                    <Image
                      src={instr.imageUrl}
                      alt={instr.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8">
                      <h3 className="font-heading text-3xl font-light text-primary-foreground md:text-4xl">
                        {instr.name}
                      </h3>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-foreground/85">
                        {instr.title}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <p className="font-heading text-lg font-light italic text-primary">
                      &ldquo;{instr.bio}&rdquo;
                    </p>
                    {instr.philosophy && (
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {instr.philosophy}
                      </p>
                    )}
                    {specialties.length > 0 && (
                      <div className="mt-5">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/50">
                          Specialties
                        </h4>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {specialties.map((s) => (
                            <li
                              key={s}
                              className="border border-border bg-secondary/40 px-3 py-1 text-xs text-primary/80"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {certifications.length > 0 && (
                      <div className="mt-5">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/50">
                          Certifications
                        </h4>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {certifications.join(' · ')}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
