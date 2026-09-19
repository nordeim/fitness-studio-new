import Image from 'next/image'

const GALLERY = [
  { src: '/images/gallery-1.jpg', alt: 'Gallery 1', className: 'md:col-span-3 md:row-span-2 aspect-[4/3]' },
  { src: '/images/gallery-2.jpg', alt: 'Gallery 2', className: 'md:col-span-3 aspect-[4/3]' },
  { src: '/images/gallery-3.jpg', alt: 'Gallery 3', className: 'md:col-span-2 aspect-[4/3]' },
  { src: '/images/gallery-4.jpg', alt: 'Gallery 4', className: 'md:col-span-2 aspect-[4/3]' },
  { src: '/images/gallery-5.jpg', alt: 'Gallery 5', className: 'md:col-span-2 aspect-[4/3]' },
  { src: '/images/gallery-6.jpg', alt: 'Gallery 6', className: 'md:col-span-2 aspect-[4/3]' },
  { src: '/images/gallery-7.jpg', alt: 'Gallery 7', className: 'md:col-span-2 aspect-[4/3]' },
] as const

/**
 * THE SPACE — asymmetric editorial gallery grid ("Where strength lives").
 */
export function GallerySection() {
  return (
    <section aria-labelledby="space" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="kicker text-primary/60">The space</p>
        <h2
          id="space"
          className="font-heading mt-4 text-4xl font-extralight italic tracking-tight text-primary md:text-5xl"
        >
          Where strength lives
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6 md:gap-6">
          {GALLERY.map((g) => (
            <div
              key={g.src}
              className={`group relative overflow-hidden rounded-xl ${g.className}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
