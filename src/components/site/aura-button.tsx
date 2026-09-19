import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The two signature AURA button styles:
 * - dark: espresso fill, cream uppercase micro-type, sharp corners
 * - outline: 1px espresso border, transparent
 * Both render an arrow that slides on hover.
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
    'group inline-flex min-h-11 items-center justify-center gap-3 px-8 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    dark: 'bg-primary text-primary-foreground hover:bg-primary/85',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    light: 'border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary',
  } as const

  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={1.5}
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
