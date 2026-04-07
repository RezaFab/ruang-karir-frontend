import type { CareerRecommendation } from '../../types'

interface CareerRecommendationCardProps {
  recommendation: CareerRecommendation
  onSelect?: (careerGoalId: string) => void
  isSelected?: boolean
}

export function CareerRecommendationCard({
  recommendation,
  onSelect,
  isSelected = false,
}: CareerRecommendationCardProps) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition ${
        isSelected ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-ink">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-muted">
            Estimasi transisi {recommendation.estimatedTransitionMonths} bulan
          </p>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
          Match {recommendation.matchScore}%
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-muted">
        {recommendation.reasons.map((reason) => (
          <li key={reason} className="rounded-lg bg-panel p-2">
            {reason}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {recommendation.keySkillsToBuild.map((skill) => (
          <span key={skill} className="rounded-full border border-border px-2 py-1 text-xs text-muted">
            {skill}
          </span>
        ))}
      </div>

      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(recommendation.careerGoalId)}
          className="mt-5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {isSelected ? 'Dipilih' : 'Pilih Jalur Ini'}
        </button>
      ) : null}
    </article>
  )
}
