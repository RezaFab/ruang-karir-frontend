import { Link } from 'react-router-dom'
import { ErrorState, LoadingSkeleton, SectionHeader, StatCard } from '../components'
import {
  useLearningPathQuery,
  useProgressSummaryQuery,
  useUserProfileQuery,
} from '../hooks/useCareerApi'
import { useAssessmentStore } from '../store'
import { formatDate } from '../utils'

function resolveLearningPathId(selectedCareerGoalId?: string) {
  if (selectedCareerGoalId === 'cg-product-manager') {
    return 'lp-product-manager'
  }

  if (selectedCareerGoalId === 'cg-frontend-engineer') {
    return 'lp-frontend-engineer'
  }

  if (selectedCareerGoalId === 'cg-digital-marketing') {
    return 'lp-digital-marketing'
  }

  return 'lp-data-analyst'
}

export default function ProgressDashboardPage() {
  const selectedCareerGoalId = useAssessmentStore((state) => state.selectedCareerGoalId)
  const learningPathId = resolveLearningPathId(selectedCareerGoalId)

  const {
    data: userProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfileQuery()

  const {
    data: progressSummary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useProgressSummaryQuery(learningPathId)

  const { data: learningPath } = useLearningPathQuery(learningPathId)

  if (profileLoading || summaryLoading) {
    return <LoadingSkeleton lines={7} />
  }

  if (profileError || summaryError || !progressSummary) {
    return (
      <ErrorState
        title="Dasbor belum bisa ditampilkan"
        description="Gagal mengambil ringkasan progres belajar."
        onRetry={() => {
          void refetchSummary()
        }}
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Dasbor Progres"
        subtitle={`Pantau kesiapan karier ${userProfile?.fullName ?? 'pengguna'} secara menyeluruh.`}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Progres Keseluruhan" value={`${progressSummary.completionRate}%`} />
        <StatCard
          label="Modul Selesai"
          value={`${progressSummary.completedModules}/${progressSummary.totalModules}`}
        />
        <StatCard label="Jam Belajar" value={`${progressSummary.totalHoursSpent} jam`} />
        <StatCard label="Target Jalur" value={learningPath?.title ?? 'Jalur Belajar'} />
      </div>

      <article className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-heading text-2xl font-semibold text-ink">Timeline Belajar</h2>
        <div className="mt-4 space-y-3">
          {progressSummary.timeline.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    item.status === 'done' ? 'bg-success-soft text-success' : 'bg-panel text-muted'
                  }`}
                >
                  {item.status === 'done' ? 'Selesai' : 'Berikutnya'}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(item.date)}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-heading text-2xl font-semibold text-ink">Panel Saran AI</h2>
          <div className="mt-4 space-y-3">
            {progressSummary.aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-ink">{suggestion.title}</p>
                <p className="mt-1 text-sm text-muted">{suggestion.description}</p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {suggestion.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Pengingat Aksi Berikutnya</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">{progressSummary.nextAction}</h2>
          <p className="mt-3 text-sm text-muted">
            Strategi ini membantu menjaga konsistensi pace belajar dan mempercepat skor kesiapan.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={`/learning-path/${learningPathId}`}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
            >
              Lanjut Belajar
            </Link>
            <Link
              to="/assessment/result"
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              Lihat Hasil Asesmen
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
