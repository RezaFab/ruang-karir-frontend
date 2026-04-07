import { CandidateCard, EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useCompanyCandidatesQuery } from '../hooks/useCareerApi'
import { useUiStore } from '../store'

export default function CompanyViewPage() {
  const candidateSort = useUiStore((state) => state.candidateSort)
  const setCandidateSort = useUiStore((state) => state.setCandidateSort)

  const { data: candidates, isLoading, isError, refetch } = useCompanyCandidatesQuery()

  if (isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Kandidat perusahaan belum tersedia"
        description="Terjadi kendala saat mengambil data kandidat unggulan."
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  const sortedCandidates = [...(candidates ?? [])].sort((a, b) => {
    if (candidateSort === 'name') {
      return a.fullName.localeCompare(b.fullName)
    }

    return b.readinessScore - a.readinessScore
  })

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
        title="Tampilan Perusahaan / HR"
        subtitle="Placeholder B2B untuk menampilkan kandidat unggulan berdasarkan skor kesiapan."
      />

      <article className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Urutkan Kandidat</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['readiness', 'name'] as const).map((sortKey) => (
            <button
              type="button"
              key={sortKey}
              onClick={() => setCandidateSort(sortKey)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                candidateSort === sortKey
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border text-muted'
              }`}
            >
              {sortKey === 'readiness' ? 'Skor Kesiapan' : 'Nama'}
            </button>
          ))}
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </section>
  )
}
