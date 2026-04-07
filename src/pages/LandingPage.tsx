import { Link } from 'react-router-dom'
import heroIllustration from '../assets/hero-illustration.svg'
import journeyIllustration from '../assets/journey-illustration.svg'
import { ErrorState, LoadingSkeleton, SectionHeader, StatCard } from '../components'
import { useBadgesQuery, useIndustryTrendsQuery } from '../hooks/useCareerApi'

const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export default function LandingPage() {
  const {
    data: industryTrends,
    isLoading: trendsLoading,
    isError: trendsError,
    refetch: refetchTrends,
  } = useIndustryTrendsQuery()

  const { data: badges } = useBadgesQuery()

  const unlockedCount = badges?.filter((badge) => badge.isUnlocked).length ?? 0

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 pt-14 md:grid-cols-2 md:items-center">
        <div>
          <p className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            AI Career Navigator
          </p>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-ink md:text-6xl">
            Tentukan Arah Karier, Bangun Skill yang Dibutuhkan Industri.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted md:text-lg">
            Ruang Karir membantu alih profesi, fresh graduate, dan pencari kerja menemukan role yang tepat
            lalu menyusun kurikulum belajar personal secara otomatis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/assessment"
              className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Mulai Assessment
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-panel"
            >
              Lihat Demo Dashboard
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,#ffd7c2,transparent_65%)]" />
          <img
            src={heroIllustration}
            alt="Visualisasi AI assessment dan learning path Ruang Karir"
            className="w-full rounded-3xl border border-border shadow-[0_20px_60px_rgba(14,30,46,0.14)]"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-10 md:grid-cols-4">
          <StatCard label="Target user" value="3 segmen utama" helper="Alih profesi, fresh graduate, job seeker" />
          <StatCard label="Mode assessment" value="2 jalur" helper="Punya target role atau belum punya target" />
          <StatCard label="Dummy endpoint" value="9 contract" helper="Siap swap ke backend API real" />
          <StatCard label="Badge unlocked" value={`${unlockedCount}`} helper="Progress gamification untuk motivasi belajar" />
        </div>
      </section>

      <section id="masalah" className="mx-auto w-full max-w-6xl px-6 py-18">
        <SectionHeader
          title="Masalah yang Diselesaikan"
          subtitle="Banyak pencari kerja bingung memilih tujuan karier dan belajar tanpa urutan yang jelas."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-heading text-lg font-semibold text-ink">Arah karier tidak jelas</h3>
            <p className="mt-2 text-sm text-muted">User sering mengikuti tren tanpa tahu kecocokan profilnya.</p>
          </article>
          <article className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-heading text-lg font-semibold text-ink">Belajar tidak terstruktur</h3>
            <p className="mt-2 text-sm text-muted">Materi tersebar dan sulit diukur dampaknya untuk employability.</p>
          </article>
          <article className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-heading text-lg font-semibold text-ink">Gap dengan kebutuhan industri</h3>
            <p className="mt-2 text-sm text-muted">Skill yang dipelajari belum tentu relevan dengan demand pasar.</p>
          </article>
        </div>
      </section>

      <section id="cara-kerja" className="bg-panel">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-18 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeader
              title="Cara Kerja Platform"
              subtitle="Dua jalur rekomendasi agar hasil personalisasi tetap relevan untuk kondisi user yang berbeda."
            />
            <ol className="mt-6 space-y-4">
              <li className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Jalur 1</p>
                <p className="mt-1 text-sm text-ink">
                  Jika user sudah punya tujuan karier, AI langsung menghasilkan learning path personal.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Jalur 2</p>
                <p className="mt-1 text-sm text-ink">
                  Jika user belum punya tujuan, AI merekomendasikan role terbaik lalu membuat learning path.
                </p>
              </li>
            </ol>
          </div>

          <img
            src={transparentPixel}
            data-src={journeyIllustration}
            alt="Diagram alur assessment ke rekomendasi karier"
            className="lozad h-full w-full rounded-3xl border border-border object-cover shadow-[0_20px_40px_rgba(14,30,46,0.12)]"
            loading="lazy"
            fetchPriority="low"
          />
        </div>
      </section>

      <section id="manfaat" className="mx-auto w-full max-w-6xl px-6 py-18">
        <SectionHeader
          title="Manfaat untuk User dan Perusahaan"
          subtitle="Ruang Karir mempercepat readiness kandidat sekaligus memudahkan HR menemukan talenta tepat."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-heading text-xl font-semibold text-ink">Untuk User</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Learning path personal sesuai skill gap.</li>
              <li>Progres belajar terukur dari modul ke modul.</li>
              <li>Rekomendasi aksi berikutnya dari AI suggestion panel.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-heading text-xl font-semibold text-ink">Untuk Perusahaan</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Ringkasan readiness kandidat lebih cepat dianalisis.</li>
              <li>Skill evidence berbasis progress modul dan portfolio.</li>
              <li>Arah B2B talent pipeline untuk kebutuhan hiring.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <SectionHeader
            title="Industry Trends Snapshot"
            subtitle="Data dummy diakses via API layer untuk simulasi integrasi backend nyata."
          />

          <div className="mt-6">
            {trendsLoading ? <LoadingSkeleton lines={4} /> : null}

            {trendsError ? (
              <ErrorState
                title="Gagal memuat tren industri"
                description="Periksa koneksi lalu coba kembali."
                onRetry={() => {
                  void refetchTrends()
                }}
              />
            ) : null}

            {!trendsLoading && !trendsError ? (
              <div className="grid gap-4 md:grid-cols-3">
                {industryTrends?.map((trend) => (
                  <article key={trend.id} className="rounded-2xl border border-border bg-surface p-5">
                    <h3 className="font-heading text-lg font-semibold text-ink">{trend.sector}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{trend.growthRate}</p>
                    <p className="mt-3 text-sm text-muted">{trend.insight}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.1em] text-muted">
                      Demand level: {trend.demandLevel}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-18">
        <div className="rounded-3xl bg-ink p-8 text-white md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Siap mulai?</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
            Jalankan assessment dan lihat learning path personalmu.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Gunakan prototype ini untuk demo pitch: flow user lengkap dari asesmen sampai dashboard progress.
          </p>
          <Link
            to="/assessment"
            className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            Mulai Sekarang
          </Link>
        </div>
      </section>
    </>
  )
}
