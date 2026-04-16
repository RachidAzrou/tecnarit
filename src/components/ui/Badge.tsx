import type React from 'react'
import { cn } from '../../lib/cn'

export function Badge(props: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium tracking-wide text-[rgb(var(--muted))] ring-1 ring-[rgb(var(--line))] bg-[rgb(var(--surface))]',
        props.className,
      )}
    >
      {props.children}
    </span>
  )
}

