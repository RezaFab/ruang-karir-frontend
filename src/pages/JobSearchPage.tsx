import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useJobRecommendationsQuery } from '../hooks/useCareerApi'
import { formatDate } from '../utils'

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
  const { data, isLoading, isError, refetch } = useJobRecommendationsQuery()

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
        <p className="mt-2 font-heading text-5xl font-semibold">{data.insight.overallProfileMatchScore}</p>
        <p className="mt-2 text-sm font-semibold text-white/90">{data.insight.readinessLabel}</p>
        <p className="mt-3 max-w-3xl text-sm text-white/90">{data.insight.note}</p>

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

      <div className="grid gap-4 md:grid-cols-2">
        {data.recommendations.map((job) => (
          <article key={job.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-semibold text-ink">{job.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {job.companyName} • {job.location}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resolveMatchTone(job.profileMatchScore)}`}>
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
    </section>
  )
}
