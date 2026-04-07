import { Link } from 'react-router-dom'
import heroIllustration from '../assets/hero-illustration.svg'
import journeyIllustration from '../assets/journey-illustration.svg'
import { SectionHeader, StatCard } from '../components'

const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 pt-14 md:grid-cols-2 md:items-center">
        <div>
          <p className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Navigator Karier AI
          </p>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-ink md:text-6xl">
            Temukan Arah Karier yang Tepat, Belajar Sesuai Kebutuhan Industri.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted md:text-lg">
            Ruang Karir membantu alih profesi, fresh graduate, dan pencari kerja umum untuk menentukan
            target karier lalu mendapatkan kurikulum belajar personal secara otomatis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/assessment"
              className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Mulai Asesmen Gratis
            </Link>
            <a
              href="#cara-kerja"
              className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-panel"
            >
              Pelajari Cara Kerja
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,#ffd7c2,transparent_65%)]" />
          <img
            src={heroIllustration}
            alt="Visualisasi AI asesmen dan jalur belajar Ruang Karir"
            className="w-full rounded-3xl border border-border shadow-[0_20px_60px_rgba(14,30,46,0.14)]"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-10 md:grid-cols-4">
          <StatCard
            label="Fokus Pengguna"
            value="3 segmen utama"
            helper="Alih profesi, fresh graduate, dan pencari kerja"
          />
          <StatCard
            label="Asesmen AI"
            value="2 jalur personal"
            helper="Punya target karier atau butuh rekomendasi dulu"
          />
          <StatCard
            label="Jalur Belajar"
            value="Kurikulum adaptif"
            helper="Modul belajar disusun dari skill gap masing-masing user"
          />
          <StatCard
            label="Hasil Utama"
            value="Kesiapan Karier"
            helper="Progres terukur agar pengguna lebih siap masuk pasar kerja"
          />
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
            <p className="mt-2 text-sm text-muted">
              Pengguna sering mengikuti tren tanpa tahu kecocokan profilnya.
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-heading text-lg font-semibold text-ink">Belajar tidak terstruktur</h3>
            <p className="mt-2 text-sm text-muted">Materi tersebar dan sulit diukur dampaknya untuk employability.</p>
          </article>
          <article className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-heading text-lg font-semibold text-ink">Gap dengan kebutuhan industri</h3>
            <p className="mt-2 text-sm text-muted">
              Skill yang dipelajari belum tentu relevan dengan permintaan pasar.
            </p>
          </article>
        </div>
      </section>

      <section id="cara-kerja" className="bg-panel">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-18 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeader
              title="Cara Kerja Ruang Karir"
              subtitle="Dua jalur rekomendasi agar hasil personalisasi tetap relevan untuk kondisi user yang berbeda."
            />
            <ol className="mt-6 space-y-4">
              <li className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Jalur 1</p>
                <p className="mt-1 text-sm text-ink">
                  Pengguna sudah punya target karier, AI langsung menyusun jalur belajar personal.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Jalur 2</p>
                <p className="mt-1 text-sm text-ink">
                  Pengguna belum punya target, AI merekomendasikan beberapa peran paling cocok lalu membuat
                  jalur belajar.
                </p>
              </li>
            </ol>
          </div>

          <img
            src={transparentPixel}
            data-src={journeyIllustration}
            alt="Diagram alur asesmen ke rekomendasi karier"
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
              <li>Jalur belajar personal sesuai skill gap.</li>
              <li>Progres belajar terukur dari modul ke modul.</li>
              <li>Arahan langkah berikutnya agar transisi karier lebih fokus.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-heading text-xl font-semibold text-ink">Untuk Perusahaan</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Ringkasan kesiapan kandidat lebih cepat dianalisis.</li>
              <li>Bukti skill berbasis progres modul dan portofolio.</li>
              <li>Arah B2B talent pipeline untuk kebutuhan rekrutmen.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <SectionHeader
            title="Lencana dan Pencapaian"
            subtitle="Gamifikasi dirancang untuk menjaga motivasi belajar sampai pengguna siap melamar pekerjaan."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Penjelajah Karier</p>
              <h3 className="mt-2 font-heading text-lg font-semibold text-ink">Asesmen Selesai</h3>
              <p className="mt-2 text-sm text-muted">
                Diberikan saat pengguna menyelesaikan asesmen karier awal.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Pembangun Momentum</p>
              <h3 className="mt-2 font-heading text-lg font-semibold text-ink">Milestone Progres Awal</h3>
              <p className="mt-2 text-sm text-muted">
                Diberikan ketika pengguna konsisten menyelesaikan modul awal.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Siap Interview</p>
              <h3 className="mt-2 font-heading text-lg font-semibold text-ink">Sinyal Kesiapan Karier</h3>
              <p className="mt-2 text-sm text-muted">
                Menandai pengguna siap lanjut ke tahap simulasi interview dan melamar kerja.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-18">
        <div className="rounded-3xl bg-ink p-8 text-white md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Siap mulai?</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
            Jalankan asesmen dan dapatkan roadmap karier personalmu.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Cukup beberapa menit untuk memetakan profilmu, lalu AI akan membantu menentukan jalur belajar
            paling relevan.
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
