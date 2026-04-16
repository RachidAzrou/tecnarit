import type React from 'react'
import { cn } from '../../lib/cn'

export function Container(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn('container-pad', props.className)}>{props.children}</div>
}

