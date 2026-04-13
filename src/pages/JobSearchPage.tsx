import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useJobRecommendationsQuery } from '../hooks/useCareerApi'
import { formatDate } from '../utils'

const jobRecommendationPageSizeOptions = [10, 25, 50, 100] as const

function resolveMatchTone(score: number): string {
  if (score >= 85) {
    return 'bg-success-soft text-success'
  }

  if (score >= 70) {
    return 'bg-primary-soft text-primary'
  }

  return 'bg-panel text-muted'
}

export default function JobSearchPage() {
  const [searchParams] = useSearchParams()
  const initialSearchQuery = searchParams.get('q')?.trim() ?? ''
  const { data, isLoading, isError, refetch } = useJobRecommendationsQuery()
  const [searchInput, setSearchInput] = useState(initialSearchQuery)
  const [workModeFilter, setWorkModeFilter] = useState<'all' | 'remote' | 'hybrid' | 'onsite'>('all')
  const [jobTypeFilter, setJobTypeFilter] = useState<'all' | 'full-time' | 'contract' | 'freelance'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(jobRecommendationPageSizeOptions[0])

  const filteredRecommendations = useMemo(() => {
    const recommendations = data?.recommendations ?? []
    const normalizedSearch = searchInput.trim().toLowerCase()

    return recommendations.filter((job) => {
      if (workModeFilter !== 'all' && job.workMode !== workModeFilter) {
        return false
      }

      if (jobTypeFilter !== 'all' && job.jobType !== jobTypeFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableText = [
        job.title,
        job.companyName,
        job.location,
        job.summary,
        ...job.requiredSkills,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [data, jobTypeFilter, searchInput, workModeFilter])
  const totalItems = filteredRecommendations.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(page, totalPages)
  const paginatedRecommendations = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return filteredRecommendations.slice(startIndex, startIndex + pageSize)
  }, [activePage, filteredRecommendations, pageSize])

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPage(1)
  }

  function handleWorkModeFilterChange(value: 'all' | 'remote' | 'hybrid' | 'onsite') {
    setWorkModeFilter(value)
    setPage(1)
  }

  function handleJobTypeFilterChange(value: 'all' | 'full-time' | 'contract' | 'freelance') {
    setJobTypeFilter(value)
    setPage(1)
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value)
    setPage(1)
  }

  function handlePreviousPage() {
    if (activePage <= 1) {
      return
    }

    setPage(activePage - 1)
  }

  function handleNextPage() {
    if (activePage >= totalPages) {
      return
    }

    setPage(activePage + 1)
  }

  if (isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Rekomendasi kerja belum tersedia"
        description="Terjadi kendala saat memuat data lowongan dan skor kesesuaian profil."
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!data?.recommendations.length) {
    return (
      <EmptyState
        title="Belum ada lowongan yang cocok"
        description="Lengkapi assessment atau update skill untuk mendapatkan rekomendasi kerja terbaru."
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Pencarian Kerja"
        subtitle="Daftar lowongan diprioritaskan berdasarkan kesesuaian profil dan hasil asesmen."
      />

      <article className="rounded-3xl border border-border bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] p-6 text-white shadow-[0_20px_45px_rgba(15,39,64,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Skor Kesesuaian Profil</p>
        <p className="mt-2 font-heading text-5xl font-semibold">{data?.insight.overallProfileMatchScore ?? 0}</p>
        <p className="mt-2 text-sm font-semibold text-white/90">{data?.insight.readinessLabel ?? '-'}</p>
        <p className="mt-3 max-w-3xl text-sm text-white/90">{data?.insight.note ?? '-'}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/assessment"
            className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
          >
            Update Asesmen
          </Link>
          <Link
            to="/learning-path/lp-data-analyst"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90"
          >
            Tingkatkan Skill Gap
          </Link>
        </div>
      </article>

      <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="w-full max-w-xl space-y-1.5 text-sm">
            <span className="font-medium text-ink">Cari lowongan</span>
            <input
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Cari posisi, perusahaan, skill, atau lokasi"
              className="input-field"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
          >
            {showFilters ? 'Tutup Filter' : 'Filter'}
          </button>
        </div>

        {showFilters ? (
          <div className="space-y-3 rounded-xl border border-border bg-white p-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Mode Kerja</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['all', 'remote', 'hybrid', 'onsite'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleWorkModeFilterChange(mode)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      workModeFilter === mode
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-muted hover:bg-panel'
                    }`}
                  >
                    {mode === 'all' ? 'Semua' : mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Tipe Kerja</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['all', 'full-time', 'contract', 'freelance'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleJobTypeFilterChange(type)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      jobTypeFilter === type
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-muted hover:bg-panel'
                    }`}
                  >
                    {type === 'all' ? 'Semua' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

      </section>

      {totalItems === 0 ? (
        <EmptyState
          title="Tidak ada lowongan yang cocok"
          description="Coba ubah kata kunci pencarian atau filter lowongan."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {paginatedRecommendations.map((job) => (
              <article key={job.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-ink">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {job.companyName} | {job.location}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${resolveMatchTone(job.profileMatchScore)}`}
                  >
                    Match {job.profileMatchScore}%
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted">{job.summary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    {job.workMode}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    {job.jobType}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    {job.salaryRange}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-panel px-2.5 py-1 text-xs font-medium text-ink">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">Diposting {formatDate(job.postedAt)}</p>
                  <button
                    type="button"
                    className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Simpan Lowongan
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-3 text-muted">
              <label className="flex items-center">
                <select
                  value={pageSize}
                  onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                  aria-label="Jumlah data per halaman"
                  className="input-field min-w-[100px] py-1.5"
                >
                  {jobRecommendationPageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <span>
                Menampilkan {paginatedRecommendations.length} dari {totalItems} lowongan | Halaman {activePage}/
                {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={activePage <= 1}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={activePage >= totalPages}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
