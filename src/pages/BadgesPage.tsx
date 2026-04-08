import { useMemo, useState } from 'react'
import badgePreview from '../assets/badge-preview.svg'
import { BadgeCard, EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useBadgesQuery } from '../hooks/useCareerApi'

const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
const badgePageSizeOptions = [10, 25, 50, 100] as const

export default function BadgesPage() {
  const { data: badges, isLoading, isError, refetch } = useBadgesQuery()
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(badgePageSizeOptions[0])
  const unlockedBadges = useMemo(() => (badges ?? []).filter((badge) => badge.isUnlocked), [badges])
  const filteredBadges = useMemo(() => {
    const badgeList = badges ?? []
    const normalizedSearch = searchInput.trim().toLowerCase()

    return badgeList.filter((badge) => {
      if (statusFilter === 'unlocked' && !badge.isUnlocked) {
        return false
      }

      if (statusFilter === 'locked' && badge.isUnlocked) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableText = [badge.name, badge.description, badge.requirement].join(' ').toLowerCase()
      return searchableText.includes(normalizedSearch)
    })
  }, [badges, searchInput, statusFilter])
  const totalItems = filteredBadges.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(page, totalPages)
  const paginatedBadges = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return filteredBadges.slice(startIndex, startIndex + pageSize)
  }, [activePage, filteredBadges, pageSize])

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPage(1)
  }

  function handleStatusFilterChange(value: 'all' | 'unlocked' | 'locked') {
    setStatusFilter(value)
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
        title="Lencana belum dapat ditampilkan"
        description="Gagal memuat data lencana."
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!badges?.length) {
    return (
      <EmptyState
        title="Belum ada lencana"
        description="Selesaikan modul untuk membuka lencana pertama."
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Lencana & Pencapaian"
        subtitle="Koleksi pencapaian belajar untuk menunjukkan konsistensi dan kesiapan transisi karier."
      />

      <article className="grid gap-6 rounded-3xl border border-border bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] p-6 text-white md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Pratinjau Lencana Digital</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">Credential siap dipamerkan</h2>
          <p className="mt-2 text-sm text-white/90">
            Lencana bisa dipakai untuk portofolio, profil profesional, atau bukti progres ke recruiter.
          </p>
          <p className="mt-3 text-sm font-semibold text-white">
            Terbuka {unlockedBadges.length} dari {badges.length} lencana
          </p>
        </div>

        <img
          src={transparentPixel}
          data-src={badgePreview}
          alt="Pratinjau lencana digital Ruang Karir"
          className="lozad w-full rounded-2xl border border-border bg-white"
          loading="lazy"
          fetchPriority="low"
        />
      </article>

      <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="w-full max-w-xl space-y-1.5 text-sm">
            <span className="font-medium text-ink">Cari lencana</span>
            <input
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Cari nama atau syarat lencana"
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
          <div className="rounded-xl border border-border bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status Lencana</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleStatusFilterChange('all')}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  statusFilter === 'all'
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border text-muted hover:bg-panel'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('unlocked')}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  statusFilter === 'unlocked'
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border text-muted hover:bg-panel'
                }`}
              >
                Sudah didapat
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('locked')}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  statusFilter === 'locked'
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border text-muted hover:bg-panel'
                }`}
              >
                Terkunci
              </button>
            </div>
          </div>
        ) : null}

      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Daftar Lencana</h3>
        {totalItems === 0 ? (
          <EmptyState
            title="Tidak ada lencana yang cocok"
            description="Ubah kata kunci pencarian atau filter status."
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
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
                    {badgePageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <span>
                  Menampilkan {paginatedBadges.length} dari {totalItems} lencana | Halaman {activePage}/
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
    </section>
  )
}
