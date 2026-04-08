import type { AssessmentHistoryItem } from '../../types'
import { formatDate, toSentenceCase } from '../../utils'

interface AssessmentHistoryCardProps {
  item: AssessmentHistoryItem
  careerGoalTitle?: string
  isLatest?: boolean
  onOpenResult: (assessmentId: string, careerGoalId?: string) => void
}

function toDisplayText(value: string | undefined): string {
  if (!value) {
    return '-'
  }

  return toSentenceCase(value.replace('-', ' '))
}

export function AssessmentHistoryCard({
  item,
  careerGoalTitle,
  isLatest = false,
  onOpenResult,
}: AssessmentHistoryCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          Asesmen {formatDate(item.submittedAt)}
        </p>
        {isLatest ? (
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
            Terbaru
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-sm text-muted">
        <p>
          Target karier:{' '}
          <span className="font-medium text-ink">
            {careerGoalTitle ?? (item.hasCareerGoal ? 'Sudah dipilih' : 'Belum ditentukan')}
          </span>
        </p>
        <p>
          Role saat asesmen: <span className="font-medium text-ink">{item.currentRole ?? '-'}</span>
        </p>
        <p>
          Preferensi kerja:{' '}
          <span className="font-medium text-ink">
            {toDisplayText(item.workMode)} / {toDisplayText(item.jobType)}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.existingSkills.slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-full border border-border px-2 py-1 text-xs text-muted">
            {skill}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onOpenResult(item.assessmentId, item.careerGoalId)}
        className="mt-5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        {item.hasCareerGoal ? 'Lihat Hasil & Jalur' : 'Pilih Arah Karier'}
      </button>
    </article>
  )
}
