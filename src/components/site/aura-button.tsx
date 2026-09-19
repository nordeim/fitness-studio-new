import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The signature AURA button, measured off the source app:
 * rounded (6px), px-6 py-2.5, 12px uppercase micro-type, tracking 0.1em
 * that eases out to 0.2em on hover, arrow-up-right glyph that lifts on hover.
 * - dark: espresso fill, cream text
 * - light: cream fill, espresso text (over dark/photo surfaces)
 * - outline: 1px espresso border, transparent
 */
export function AuraButton({
  href,
  children,
  variant = 'dark',
  className,
  onClick,
  type,
  disabled,
}: {
  href?: string
  children: React.ReactNode
  variant?: 'dark' | 'outline' | 'light'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base =
    'group inline-flex items-center justify-center gap-2 rounded px-6 py-2.5 font-body text-xs font-medium uppercase tracking-[0.1em] transition-all duration-300 hover:tracking-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    dark: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    light: 'bg-primary-foreground text-primary hover:opacity-90',
  } as const

  const inner = (
    <>
      <span>{children}</span>
      <ArrowUpRight
        className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={2}
        aria-hidden="true"
      />
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn(base, variants[variant], className)}>
        {inner}
      </Link>
    )
  }
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], className)}
    >
      {inner}
    </button>
  )
}
