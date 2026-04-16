import type React from 'react'
import { cn } from '../../lib/cn'

export function SectionHeading(
  props: React.PropsWithChildren<{
    eyebrow?: string
    title: string
    description?: string
    align?: 'left' | 'center'
    className?: string
  }>,
) {
  const align = props.align ?? 'left'

  return (
    <header
      className={cn(
        'space-y-3',
        align === 'center' ? 'text-center mx-auto' : 'text-left',
        props.className,
      )}
    >
      {props.eyebrow ? (
        <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
          {props.eyebrow}
        </div>
      ) : null}
      <h2 className="font-[var(--font-serif)] text-3xl leading-[1.05] tracking-[-0.02em] text-[rgb(var(--ink))] sm:text-4xl">
        {props.title}
      </h2>
      {props.description ? (
        <p className="max-w-2xl text-[15px] leading-relaxed text-[rgb(var(--muted))] sm:text-[16px]">
          {props.description}
        </p>
      ) : null}
      {props.children}
    </header>
  )
}

