import type { Badge } from '../../types'
import { formatDate } from '../../utils'

interface BadgeCardProps {
  badge: Badge
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        badge.isUnlocked ? 'border-success/60 bg-success-soft' : 'border-border bg-surface opacity-75'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {badge.isUnlocked ? 'Terbuka' : 'Terkunci'}
      </p>
      <h3 className="mt-1 font-heading text-xl font-semibold text-ink">{badge.name}</h3>
      <p className="mt-2 text-sm text-muted">{badge.description}</p>
      <p className="mt-3 text-sm font-medium text-ink">Syarat: {badge.requirement}</p>
      {badge.unlockedAt ? (
        <p className="mt-2 text-xs text-muted">Didapat pada {formatDate(badge.unlockedAt)}</p>
      ) : null}
    </article>
  )
}
