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

  const unlockedBadges = badges.filter((badge) => badge.isUnlocked)
  const lockedBadges = badges.filter((badge) => !badge.isUnlocked)

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

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Lencana yang Sudah Didapat</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {unlockedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Lencana Terkunci</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lockedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>
    </section>
  )
}
