import type { CompanyCandidateSummary } from '../../types'

interface CandidateCardProps {
  candidate: CompanyCandidateSummary
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-xl font-semibold text-ink">{candidate.fullName}</h3>
          <p className="text-sm text-muted">Target role: {candidate.targetRole}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            candidate.status === 'Ready' ? 'bg-success-soft text-success' : 'bg-panel text-muted'
          }`}
        >
          {candidate.status}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">{candidate.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {candidate.topSkills.map((skill) => (
          <span key={skill} className="rounded-full border border-border px-2 py-1 text-xs text-muted">
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold text-ink">Readiness score: {candidate.readinessScore}/100</p>
    </article>
  )
}
