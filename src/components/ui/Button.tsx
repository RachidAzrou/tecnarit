import type React from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

export function Button(
  props: React.PropsWithChildren<{
    href?: string
    onClick?: React.MouseEventHandler
    className?: string
    variant?: Variant
    size?: Size
    target?: string
    rel?: string
    ariaLabel?: string
  }>,
) {
  const { variant = 'primary', size = 'md' } = props

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent),0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--page))] active:translate-y-[0.5px]'

  const sizes: Record<Size, string> = {
    md: 'h-11 px-4 text-[15px]',
    lg: 'h-12 px-5 text-[15px]',
  }

  const variants: Record<Variant, string> = {
    primary:
      'bg-[rgb(var(--ink))] text-white shadow-sm hover:bg-[color-mix(in_oklab,rgb(var(--ink))_92%,white)]',
    secondary:
      'bg-[rgb(var(--surface))] text-[rgb(var(--ink))] ring-1 ring-[rgb(var(--line))] hover:bg-[color-mix(in_oklab,rgb(var(--surface))_65%,rgb(var(--page)))]',
    ghost:
      'bg-transparent text-[rgb(var(--ink))] hover:bg-[color-mix(in_oklab,rgb(var(--surface))_70%,rgb(var(--page)))]',
  }

  const className = cn(base, sizes[size], variants[variant], props.className)

  if (props.href) {
    return (
      <a
        className={className}
        href={props.href}
        target={props.target}
        rel={props.rel}
        aria-label={props.ariaLabel}
      >
        {props.children}
      </a>
    )
  }

  return (
    <button className={className} onClick={props.onClick} aria-label={props.ariaLabel}>
      {props.children}
    </button>
  )
}

