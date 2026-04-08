import { useMemo, useState } from 'react'
import { CandidateCard, EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useCompanyCandidatesQuery } from '../hooks/useCareerApi'
import { ApiRequestError } from '../services/httpClient'
import { useUiStore } from '../store'

const candidatePageSizeOptions = [10, 25, 50, 100] as const

export default function CompanyViewPage() {
  const candidateSort = useUiStore((state) => state.candidateSort)
  const setCandidateSort = useUiStore((state) => state.setCandidateSort)
  const [searchInput, setSearchInput] = useState('')
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'ready' | 'needs-upskilling'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(candidatePageSizeOptions[0])

  const { data: candidates, isLoading, isError, error, refetch } = useCompanyCandidatesQuery()
  const isAccessDenied = error instanceof ApiRequestError && error.status === 403

  const sortedCandidates = useMemo(
    () =>
      [...(candidates ?? [])].sort((a, b) => {
        if (candidateSort === 'name') {
          return a.fullName.localeCompare(b.fullName)
        }

        return b.readinessScore - a.readinessScore
      }),
    [candidateSort, candidates],
  )
  const filteredCandidates = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase()

    return sortedCandidates.filter((candidate) => {
      if (readinessFilter === 'ready' && candidate.status !== 'Ready') {
        return false
      }

      if (readinessFilter === 'needs-upskilling' && candidate.status !== 'Needs Upskilling') {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableText = [
        candidate.fullName,
        candidate.targetRole,
        candidate.summary,
        ...candidate.topSkills,
      ]
        .join(' ')
        .toLowerCase()
      return searchableText.includes(normalizedSearch)
    })
  }, [readinessFilter, searchInput, sortedCandidates])
  const totalItems = filteredCandidates.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(page, totalPages)
  const paginatedCandidates = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return filteredCandidates.slice(startIndex, startIndex + pageSize)
  }, [activePage, filteredCandidates, pageSize])

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPage(1)
  }

  function handleReadinessFilterChange(value: 'all' | 'ready' | 'needs-upskilling') {
    setReadinessFilter(value)
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
        title={isAccessDenied ? 'Akses tidak diizinkan' : 'Kandidat perusahaan belum tersedia'}
        description={
          isAccessDenied
            ? 'Akun ini belum punya izin untuk membuka data kandidat.'
            : 'Terjadi kendala saat mengambil data kandidat unggulan.'
        }
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!sortedCandidates.length) {
    return (
      <EmptyState
        title="Belum ada kandidat"
        description="Data kandidat akan muncul setelah pengguna menyelesaikan progres minimum."
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Kandidat Unggulan"
        subtitle="Pantau kandidat siap kerja berdasarkan skor kesiapan, skill inti, dan ringkasan profil."
      />

      <article className="rounded-3xl border border-border bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Ringkasan Talent Pool</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">{sortedCandidates.length} kandidat terkurasi</h2>
        <p className="mt-2 text-sm text-white/90">
          Gunakan filter untuk memprioritaskan kandidat dengan tingkat kesiapan tertinggi.
        </p>

      </article>

      <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="w-full max-w-xl space-y-1.5 text-sm">
            <span className="font-medium text-ink">Cari kandidat</span>
            <input
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Cari nama, role, atau skill"
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
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Kesiapan Kandidat</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleReadinessFilterChange('all')}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    readinessFilter === 'all'
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted hover:bg-panel'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleReadinessFilterChange('ready')}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    readinessFilter === 'ready'
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted hover:bg-panel'
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() => handleReadinessFilterChange('needs-upskilling')}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    readinessFilter === 'needs-upskilling'
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted hover:bg-panel'
                  }`}
                >
                  Needs Upskilling
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Urutkan</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['readiness', 'name'] as const).map((sortKey) => (
                  <button
                    type="button"
                    key={sortKey}
                    onClick={() => setCandidateSort(sortKey)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      candidateSort === sortKey
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-muted hover:bg-panel'
                    }`}
                  >
                    {sortKey === 'readiness' ? 'Skor Kesiapan' : 'Nama'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

      </section>

      {totalItems === 0 ? (
        <EmptyState
          title="Tidak ada kandidat yang cocok"
          description="Coba ubah kata kunci pencarian atau filter."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {paginatedCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
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
                  {candidatePageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <span>
                Menampilkan {paginatedCandidates.length} dari {totalItems} kandidat | Halaman {activePage}/
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
