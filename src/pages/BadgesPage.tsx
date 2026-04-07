import badgePreview from '../assets/badge-preview.svg'
import { BadgeCard, EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useBadgesQuery } from '../hooks/useCareerApi'

const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export default function BadgesPage() {
  const { data: badges, isLoading, isError, refetch } = useBadgesQuery()

  if (isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Badge belum dapat ditampilkan"
        description="Gagal memuat data badge dari API mock."
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!badges?.length) {
    return (
      <EmptyState
        title="Belum ada badge"
        description="Selesaikan modul untuk membuka badge pertama."
      />
    )
  }

  const unlockedBadges = badges.filter((badge) => badge.isUnlocked)
  const lockedBadges = badges.filter((badge) => !badge.isUnlocked)

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Badge & Achievement"
        subtitle="Gamification untuk menjaga motivasi belajar dan menunjukkan milestone transisi karier."
      />

      <article className="grid gap-6 rounded-2xl border border-border bg-surface p-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Digital Badge Preview</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">Credential siap dipamerkan</h2>
          <p className="mt-2 text-sm text-muted">
            Badge bisa dipakai untuk portfolio, profil profesional, atau bukti progress ke recruiter.
          </p>
          <p className="mt-3 text-sm font-medium text-ink">
            Unlocked {unlockedBadges.length} dari {badges.length} badge
          </p>
        </div>

        <img
          src={transparentPixel}
          data-src={badgePreview}
          alt="Preview badge digital Ruang Karir"
          className="lozad w-full rounded-2xl border border-border bg-white"
          loading="lazy"
          fetchPriority="low"
        />
      </article>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Badge yang Sudah Didapat</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {unlockedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Badge Terkunci</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lockedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>
    </section>
  )
}
