import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'

/**
 * YOUR GUIDES — asymmetric editorial grid mirroring the source: the first
 * coach renders as a wide feature card (photo + text overlay panel), the
 * rest flow in a 3-up row. Data comes from the seeded Instructor table so
 * the home page and /instructors never disagree.
 */
export async function CoachesSection({ instructorCount }: { instructorCount?: number }) {
  const instructors = await db.instructor.findMany({ orderBy: { sortOrder: 'asc' }, take: 4 })
  const count = instructorCount ?? instructors.length
  const [lead, ...rest] = instructors
  if (!lead) return null

  return (
    <section aria-labelledby="coaches" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker text-primary/60">Your guides</p>
            <h2
              id="coaches"
              className="font-heading mt-4 text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
            >
              Meet the coaches
            </h2>
          </div>
          <Link
            href="/instructors"
            className="group inline-flex min-h-11 items-center gap-3 border border-primary px-6 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View all {count > 0 ? `(${count})` : ''}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Feature card — first coach */}
          <Link
            href={`/instructors#${lead.id}`}
            className="group relative block overflow-hidden rounded-2xl lg:col-span-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[520px]">
              <Image
                src={lead.imageUrl}
                alt={lead.name}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* White text panel overlapping the photo — the source's editorial card */}
              <div className="absolute bottom-0 right-0 m-4 max-w-xs rounded-xl bg-background p-6 shadow-lg md:m-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/50">
                  {lead.title}
                </p>
                <h3 className="font-heading mt-2 text-3xl font-light text-primary">{lead.name}</h3>
                <p className="mt-2 font-heading text-sm font-light italic text-primary/80">
                  {lead.bio}
                </p>
              </div>
            </div>
          </Link>

          {/* Remaining coaches — stacked feature rows */}
          <div className="grid gap-4 md:gap-6">
            {rest.map((instr) => (
              <Link
                key={instr.id}
                href={`/instructors#${instr.id}`}
                className="group relative block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="relative aspect-[4/3] lg:aspect-[16/9]">
                  <Image
                    src={instr.imageUrl}
                    alt={instr.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-6">
                    <h3 className="font-heading text-2xl font-light text-primary-foreground">
                      {instr.name}
                    </h3>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground/80">
                      {instr.title}
                    </p>
                    <p className="mt-1.5 hidden text-xs italic text-primary-foreground/70 md:block">
                      {instr.bio}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
