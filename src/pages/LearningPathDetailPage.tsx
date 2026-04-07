import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingSkeleton, ModuleCard, SectionHeader, StatCard } from '../components'
import {
  useLearningPathQuery,
  useProgressSummaryQuery,
  useUpdateLearningPathProgressMutation,
} from '../hooks/useCareerApi'
import { useUiStore } from '../store'

export default function LearningPathDetailPage() {
  const { id } = useParams()

  const moduleFilter = useUiStore((state) => state.moduleFilter)
  const moduleSort = useUiStore((state) => state.moduleSort)
  const setModuleFilter = useUiStore((state) => state.setModuleFilter)
  const setModuleSort = useUiStore((state) => state.setModuleSort)

  const {
    data: learningPath,
    isLoading: pathLoading,
    isError: pathError,
    refetch: refetchPath,
  } = useLearningPathQuery(id)

  const { data: progressSummary } = useProgressSummaryQuery(id)
  const updateProgressMutation = useUpdateLearningPathProgressMutation(id)

  const filteredModules = useMemo(() => {
    if (!learningPath) {
      return []
    }

    const byFilter = learningPath.modules.filter((module) => {
      if (moduleFilter === 'completed') {
        return module.isCompleted
      }

      if (moduleFilter === 'pending') {
        return !module.isCompleted
      }

      return true
    })

    return [...byFilter].sort((a, b) => {
      if (moduleSort === 'duration') {
        return a.durationHours - b.durationHours
      }

      if (moduleSort === 'provider') {
        return a.provider.localeCompare(b.provider)
      }

      return a.order - b.order
    })
  }, [learningPath, moduleFilter, moduleSort])

  if (!id) {
    return (
      <EmptyState
        title="Learning path tidak ditemukan"
        description="Path ID tidak tersedia di URL."
        action={
          <Link
            to="/assessment/result"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali ke Result
          </Link>
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Learning Path Detail"
        subtitle="Pantau modul, provider materi, durasi estimasi, dan progres belajar secara granular."
      />

      {pathLoading ? <LoadingSkeleton lines={6} /> : null}

      {pathError ? (
        <ErrorState
          title="Gagal memuat learning path"
          description="Path tidak tersedia atau terjadi gangguan jaringan."
          onRetry={() => {
            void refetchPath()
          }}
        />
      ) : null}

      {!pathLoading && !pathError && learningPath ? (
        <>
          <article className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-semibold text-ink">{learningPath.title}</h2>
            <p className="mt-2 text-sm text-muted">{learningPath.summary}</p>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <StatCard label="Level" value={learningPath.level} />
              <StatCard label="Durasi" value={`${learningPath.estimatedWeeks} minggu`} />
              <StatCard label="Total Jam" value={`${learningPath.totalHours} jam`} />
              <StatCard
                label="Completion"
                value={`${progressSummary?.completionRate ?? 0}%`}
                helper={`${progressSummary?.completedModules ?? 0} dari ${progressSummary?.totalModules ?? learningPath.modules.length} modul`}
              />
            </div>
          </article>

          <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-white p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Filter Modul</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['all', 'completed', 'pending'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setModuleFilter(filter)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      moduleFilter === filter
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-muted'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <label className="text-sm">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Sort by
              </span>
              <select
                value={moduleSort}
                onChange={(event) => setModuleSort(event.target.value as 'sequence' | 'duration' | 'provider')}
                className="input-field"
              >
                <option value="sequence">Sequence</option>
                <option value="duration">Duration</option>
                <option value="provider">Provider</option>
              </select>
            </label>
          </div>

          {filteredModules.length === 0 ? (
            <EmptyState
              title="Tidak ada modul"
              description="Tidak ada modul sesuai filter yang dipilih."
            />
          ) : (
            <div className="grid gap-4">
              {filteredModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isUpdating={updateProgressMutation.isPending}
                  onToggleComplete={(moduleId, completed) => {
                    updateProgressMutation.mutate({ moduleId, completed })
                  }}
                />
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Progress Summary</p>
            <p className="mt-2 text-sm text-ink">{progressSummary?.nextAction}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Buka Dashboard
              </Link>
              <Link
                to="/badges"
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
              >
                Lihat Badges
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
