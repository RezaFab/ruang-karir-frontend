import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
      <h3 className="font-heading text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted md:text-base">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
