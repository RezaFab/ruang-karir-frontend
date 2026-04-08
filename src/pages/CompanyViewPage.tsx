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
        title="Kandidat Unggulan"
        subtitle="Pantau kandidat siap kerja berdasarkan skor kesiapan, skill inti, dan ringkasan profil."
      />

      <article className="rounded-3xl border border-border bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Ringkasan Talent Pool</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">{sortedCandidates.length} kandidat terkurasi</h2>
        <p className="mt-2 text-sm text-white/90">
          Gunakan filter untuk memprioritaskan kandidat dengan tingkat kesiapan tertinggi.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['readiness', 'name'] as const).map((sortKey) => (
            <button
              type="button"
              key={sortKey}
              onClick={() => setCandidateSort(sortKey)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                candidateSort === sortKey
                  ? 'border-white/40 bg-white text-ink'
                  : 'border-white/30 bg-white/10 text-white'
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
