import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingSkeleton, ModuleCard, SectionHeader, StatCard } from '../components'
import {
  useLearningPathQuery,
  useLearningPathModulesQuery,
  useProgressSummaryQuery,
  useUpdateLearningPathProgressMutation,
} from '../hooks/useCareerApi'
import { useUiStore } from '../store'

function mapLevel(level: 'Beginner' | 'Intermediate' | 'Advanced') {
  if (level === 'Beginner') {
    return 'Pemula'
  }

  if (level === 'Intermediate') {
    return 'Menengah'
  }

  return 'Lanjutan'
}

const modulePageSizeOptions = [10, 25, 50, 100] as const

export default function LearningPathDetailPage() {
  const { id } = useParams()

  const moduleFilter = useUiStore((state) => state.moduleFilter)
  const moduleSort = useUiStore((state) => state.moduleSort)
  const setModuleFilterStore = useUiStore((state) => state.setModuleFilter)
  const setModuleSortStore = useUiStore((state) => state.setModuleSort)
  const [moduleSearchInput, setModuleSearchInput] = useState('')
  const [debouncedModuleSearch, setDebouncedModuleSearch] = useState('')
  const [showModuleFilters, setShowModuleFilters] = useState(false)
  const [modulePage, setModulePage] = useState(1)
  const [modulePageSize, setModulePageSize] = useState<number>(modulePageSizeOptions[0])

  const {
    data: learningPath,
    isLoading: pathLoading,
    isError: pathError,
    refetch: refetchPath,
  } = useLearningPathQuery(id)

  const { data: progressSummary } = useProgressSummaryQuery(id)
  const {
    data: moduleData,
    isLoading: modulesLoading,
    isFetching: modulesFetching,
    isError: modulesError,
    error: modulesErrorObject,
    refetch: refetchModules,
  } = useLearningPathModulesQuery(
    id,
    {
      search: debouncedModuleSearch,
      status: moduleFilter,
      sort: moduleSort,
      order: 'asc',
      page: modulePage,
      length: modulePageSize,
    },
    Boolean(id) && !pathLoading && !pathError,
  )
  const updateProgressMutation = useUpdateLearningPathProgressMutation(id)
  const moduleItems = moduleData?.items ?? []
  const modulePagination = moduleData?.pagination
  const moduleTotalItems = modulePagination?.total ?? moduleItems.length
  const moduleTotalPages = Math.max(modulePagination?.totalPages ?? 1, 1)
  const activeModulePage = modulePagination?.page ?? modulePage
  const hasModulePrevPage = modulePagination?.hasPrevPage ?? activeModulePage > 1
  const hasModuleNextPage = modulePagination?.hasNextPage ?? activeModulePage < moduleTotalPages
  const moduleErrorMessage =
    modulesErrorObject instanceof Error ? modulesErrorObject.message : 'Daftar modul belum tersedia.'

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedModuleSearch(moduleSearchInput.trim())
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [moduleSearchInput])

  function handleModuleSearchChange(value: string) {
    setModuleSearchInput(value)
    setModulePage(1)
  }

  function handleModulePageSizeChange(value: number) {
    setModulePageSize(value)
    setModulePage(1)
  }

  function handleModulePreviousPage() {
    if (!hasModulePrevPage) {
      return
    }

    setModulePage(activeModulePage - 1)
  }

  function handleModuleNextPage() {
    if (!hasModuleNextPage) {
      return
    }

    setModulePage(activeModulePage + 1)
  }

  function handleModuleFilterChange(filter: 'all' | 'completed' | 'pending') {
    setModuleFilterStore(filter)
    setModulePage(1)
  }

  function handleModuleSortChange(sort: 'sequence' | 'duration' | 'provider') {
    setModuleSortStore(sort)
    setModulePage(1)
  }

  if (!id) {
    return (
      <EmptyState
        title="Jalur belajar tidak ditemukan"
        description="ID jalur tidak tersedia di URL."
        action={
          <Link
            to="/assessment/result"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali ke Hasil
          </Link>
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Detail Jalur Belajar"
        subtitle="Pantau modul, penyedia materi, durasi estimasi, dan progres belajar secara granular."
      />

      {pathLoading ? <LoadingSkeleton lines={6} /> : null}

      {pathError ? (
        <ErrorState
          title="Gagal memuat jalur belajar"
          description="Jalur tidak tersedia atau terjadi gangguan jaringan."
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
              <StatCard label="Level" value={mapLevel(learningPath.level)} />
              <StatCard label="Durasi" value={`${learningPath.estimatedWeeks} minggu`} />
              <StatCard label="Total Jam" value={`${learningPath.totalHours} jam`} />
              <StatCard
                label="Penyelesaian"
                value={`${progressSummary?.completionRate ?? 0}%`}
                helper={`${progressSummary?.completedModules ?? 0} dari ${progressSummary?.totalModules ?? moduleTotalItems} modul`}
              />
            </div>
          </article>

          <div className="space-y-4 rounded-2xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <label className="w-full max-w-xl space-y-1.5 text-sm">
                <span className="font-medium text-ink">Cari modul</span>
                <input
                  value={moduleSearchInput}
                  onChange={(event) => handleModuleSearchChange(event.target.value)}
                  placeholder="Cari judul, provider, skill, atau level"
                  className="input-field"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowModuleFilters((previous) => !previous)}
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
              >
                {showModuleFilters ? 'Tutup Filter' : 'Filter'}
              </button>
            </div>

            {showModuleFilters ? (
              <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status Modul</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['all', 'completed', 'pending'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => handleModuleFilterChange(filter)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          moduleFilter === filter
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-border text-muted hover:bg-panel'
                        }`}
                      >
                        {filter === 'all' ? 'Semua' : filter === 'completed' ? 'Selesai' : 'Belum Selesai'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Urutkan</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {([
                      { key: 'sequence', label: 'Urutan' },
                      { key: 'duration', label: 'Durasi' },
                      { key: 'provider', label: 'Penyedia' },
                    ] as const).map((sortOption) => (
                      <button
                        key={sortOption.key}
                        type="button"
                        onClick={() => handleModuleSortChange(sortOption.key)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          moduleSort === sortOption.key
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-border text-muted hover:bg-panel'
                        }`}
                      >
                        {sortOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {modulesLoading ? <LoadingSkeleton lines={4} /> : null}

          {modulesError ? (
            <ErrorState
              title="Gagal memuat modul"
              description={moduleErrorMessage}
              onRetry={() => {
                void refetchModules()
              }}
            />
          ) : null}

          {!modulesLoading && !modulesError && moduleTotalItems === 0 ? (
            <EmptyState
              title="Tidak ada modul"
              description="Tidak ada modul sesuai pencarian atau filter yang dipilih."
            />
          ) : null}

          {!modulesLoading && !modulesError && moduleTotalItems > 0 ? (
            <>
              <div className="grid gap-4">
                {moduleItems.map((module) => (
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

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-3 text-muted">
                  <label className="flex items-center">
                    <select
                      value={modulePageSize}
                      onChange={(event) => handleModulePageSizeChange(Number(event.target.value))}
                      aria-label="Jumlah data per halaman"
                      className="input-field min-w-[100px] py-1.5"
                    >
                      {modulePageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span>
                    Menampilkan {moduleItems.length} dari {moduleTotalItems} modul | Halaman{' '}
                    {activeModulePage}/{moduleTotalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleModulePreviousPage}
                    disabled={!hasModulePrevPage || modulesFetching}
                    className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={handleModuleNextPage}
                    disabled={!hasModuleNextPage || modulesFetching}
                    className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : null}

          <div className="rounded-2xl border border-border bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Ringkasan Progres</p>
            <p className="mt-2 text-sm text-ink">{progressSummary?.nextAction}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Buka Dasbor
              </Link>
              <Link
                to="/badges"
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
              >
                Lihat Lencana
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
