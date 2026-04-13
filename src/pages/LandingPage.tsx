import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SectionHeader } from '../components'

interface EmptyImageSlotProps {
  src: string
  alt: string
  aspect?: 'wide' | 'square'
}

interface LearningTrack {
  title: string
  level: string
  duration: string
  lessons: string
  rating: string
  imageSrc: string
  imageAlt: string
}

interface HiringSignal {
  metric: string
  title: string
  detail: string
  source: string
}

interface JourneyStep {
  title: string
  detail: string
}

interface JobPreview {
  role: string
  type: string
  status: string
}

interface SuccessStory {
  name: string
  role: string
  story: string
}

const partnerLabels = [
  'Tech Startup',
  'Digital Agency',
  'SaaS Company',
  'E-commerce',
  'B2B Platform',
  'Creative Studio',
]

const learningTracks: LearningTrack[] = [
  {
    title: 'Front-End Dev',
    level: 'Beginner',
    duration: '8 minggu',
    lessons: '24 lesson + 3 proyek',
    rating: '4.8',
    imageSrc: '/images/landing/track-frontend-dev.webp',
    imageAlt: 'Track Front-End Dev',
  },
  {
    title: 'Data Analyst',
    level: 'Intermediate',
    duration: '10 minggu',
    lessons: '30 lesson + capstone',
    rating: '4.7',
    imageSrc: '/images/landing/track-data-analyst.webp',
    imageAlt: 'Track Data Analyst',
  },
  {
    title: 'Digital Marketing',
    level: 'Beginner',
    duration: '6 minggu',
    lessons: '18 lesson + simulasi',
    rating: '4.9',
    imageSrc: '/images/landing/track-digital-marketing.webp',
    imageAlt: 'Track Digital Marketing',
  },
]

const landingImageSources = {
  hero: '/images/landing/hero-learning.webp',
  careerBoard: '/images/landing/career-board.webp',
  successStory: '/images/landing/success-story.webp',
} as const

const hiringSignals: HiringSignal[] = [
  {
    metric: '63%',
    title: 'Skill gap jadi hambatan utama bisnis',
    detail:
      'Mayoritas employer mencari kandidat yang punya skill siap pakai, bukan hanya teori.',
    source: 'WEF Future of Jobs Report 2025',
  },
  {
    metric: '49%',
    title: 'L&D melihat skills crisis di organisasi',
    detail: 'Program belajar yang punya jalur karier jelas makin diprioritaskan.',
    source: 'LinkedIn Workplace Learning Report 2025',
  },
  {
    metric: '91%',
    title: 'Learner merasakan outcome karier positif',
    detail: 'Sentimen publik kuat pada pembelajaran yang berdampak ke peningkatan karier.',
    source: 'Coursera Learner Outcomes Report 2025',
  },
]

const journeySteps: JourneyStep[] = [
  {
    title: 'Pilih target role',
    detail:
      'Pilih role impianmu atau minta rekomendasi AI sesuai profil, minat, dan kekuatanmu.',
  },
  {
    title: 'Ikuti track belajar',
    detail:
      'Jalankan sprint mingguan dengan checklist progres, mini project, dan feedback mentor.',
  },
  {
    title: 'Siap apply kerja',
    detail:
      'Rapikan CV, portofolio, dan latihan interview supaya proses apply terasa lebih mantap.',
  },
]

const jobPreviews: JobPreview[] = [
  { role: 'Junior Front-End Developer', type: 'Full-time', status: 'Matched 82%' },
  { role: 'Data Reporting Analyst', type: 'Hybrid', status: 'Matched 78%' },
  { role: 'Digital Marketing Associate', type: 'Remote', status: 'Matched 80%' },
]

const successStories: SuccessStory[] = [
  {
    name: 'Anita P.',
    role: 'Career Switcher to Data',
    story:
      'Saya tadinya bingung mulai dari mana. Setelah ikut track, progresnya jelas dan saya jadi lebih percaya diri saat interview.',
  },
  {
    name: 'Rizky H.',
    role: 'Fresh Graduate',
    story:
      'Formatnya mirip course platform premium, jadi gampang ngikutin langkah demi langkah sampai siap apply kerja.',
  },
]

function EmptyImageSlot({ src, alt, aspect = 'wide' }: EmptyImageSlotProps) {
  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[16/10]'

  return (
    <div
      className={`group relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-[#edf5fc] via-[#eaf4fb] to-[#e5f1ff] shadow-[0_14px_30px_rgba(14,30,46,0.1)] ring-1 ring-[#d6e3ef] ${aspectClass}`}
    >
      <div className="landing-float-slow absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#5b8fb8]/35 blur-2xl" />
      <div className="landing-float-slow absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-[#50b8a5]/30 blur-2xl [animation-delay:1s]" />
      <div className="relative h-full">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_40%,rgba(14,30,46,0.08))]" />
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [careerSearchInput, setCareerSearchInput] = useState('')

  function handleCareerSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = careerSearchInput.trim()
    const target = query ? `/jobs/search?q=${encodeURIComponent(query)}` : '/jobs/search'

    navigate(target)
  }

  function pickSuggestedSearch(value: string) {
    setCareerSearchInput(value)
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_12%_4%,rgba(31,111,139,0.26),transparent_42%),radial-gradient(circle_at_84%_14%,rgba(80,184,165,0.24),transparent_40%)]" />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="landing-fade-up">
            <p className="inline-flex rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Job Matching + Learning
            </p>
            <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-ink md:text-6xl">
              Cari Kerja Lebih Tepat dengan Job Matching AI.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Mulai dari asesmen, cek skill gap-mu, ikuti training personal, lalu apply ke peluang kerja
              yang paling sesuai dengan profilmu.
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
                Jelajahi Learning Tracks
              </a>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-ink sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Fitur Utama</p>
                <p className="mt-1 font-semibold">Job Matching AI</p>
              </div>
              <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Fitur Utama</p>
                <p className="mt-1 font-semibold">Skill Gap Advisor</p>
              </div>
              <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Fitur Utama</p>
                <p className="mt-1 font-semibold">Personalized Training</p>
              </div>
            </div>
          </div>

          <div className="landing-fade-up landing-fade-delay-1">
            <div className="rounded-[2rem] border border-border bg-[linear-gradient(145deg,rgba(255,255,255,0.97),rgba(232,242,250,0.95))] p-5 shadow-[0_24px_60px_rgba(14,30,46,0.12)] backdrop-blur">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Career Search</p>
                <form onSubmit={handleCareerSearchSubmit} className="mt-2 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={careerSearchInput}
                      onChange={(event) => setCareerSearchInput(event.target.value)}
                      placeholder="Cari role atau skill yang kamu incar..."
                      className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="h-11 shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Cari
                    </button>
                  </div>
                </form>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => pickSuggestedSearch('Front-End')}
                    className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary transition hover:opacity-90"
                  >
                    Front-End
                  </button>
                  <button
                    type="button"
                    onClick={() => pickSuggestedSearch('Data Analyst')}
                    className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary transition hover:opacity-90"
                  >
                    Data Analyst
                  </button>
                  <button
                    type="button"
                    onClick={() => pickSuggestedSearch('Digital Marketing')}
                    className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary transition hover:opacity-90"
                  >
                    Digital Marketing
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <EmptyImageSlot src={landingImageSources.hero} alt="Hero landing image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Fokus pada penguatan talenta digital dan percepatan kesiapan kerja
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-3 lg:grid-cols-6">
            {partnerLabels.map((label) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-surface px-3 py-3 text-sm font-semibold text-ink/80"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="mx-auto w-full max-w-6xl px-6 py-18">
        <SectionHeader
          title="Katalog Learning Track Populer"
          subtitle="Setiap track disusun untuk menutup skill gap yang paling berpengaruh ke peluang diterima kerja."
        />
        <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-3">
          {learningTracks.map((track, index) => (
            <article
              key={track.title}
              className={`landing-fade-up flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-[0_16px_34px_rgba(14,30,46,0.08)] ${
                index === 1 ? 'landing-fade-delay-1' : index === 2 ? 'landing-fade-delay-2' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full border border-primary/25 bg-primary-soft px-2 py-1 font-semibold text-primary">
                  {track.level}
                </span>
                <span className="font-semibold text-ink">* {track.rating}</span>
              </div>
              <h3 className="mt-3 min-h-16 font-heading text-2xl font-semibold leading-tight text-ink">
                {track.title}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {track.duration} - {track.lessons}
              </p>
              <div className="mt-4">
                <EmptyImageSlot src={track.imageSrc} alt={track.imageAlt} aspect="square" />
              </div>
              <div className="mt-5 h-2 rounded-full bg-panel">
                <div className="h-full w-[58%] rounded-full bg-[linear-gradient(90deg,#1f6f8b,#50b8a5)]" />
              </div>
              <p className="mt-2 text-xs font-medium text-muted">58% konten siap rilis</p>
              <Link
                to="/assessment"
                className="mt-4 inline-flex w-fit rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Lihat Jalur
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="masalah" className="border-y border-border bg-panel">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-18 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeader
              title="Kenapa Ini Penting Buat Kamu"
              subtitle="Riset pasar menunjukkan perusahaan makin ketat mencari kandidat yang skill-nya benar-benar relevan."
            />
            <div className="mt-6 space-y-3">
              {hiringSignals.map((item) => (
                <article key={item.title} className="rounded-2xl border border-border bg-white p-4">
                  <p className="font-heading text-3xl font-semibold text-ink">{item.metric}</p>
                  <h3 className="mt-1 text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.11em] text-primary">{item.source}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-white p-5 shadow-[0_16px_36px_rgba(14,30,46,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Career Match Board</p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-ink">Peluang Kerja Paling Cocok untukmu</h3>
            <div className="mt-4 space-y-3">
              {jobPreviews.map((job) => (
                <article
                  key={job.role}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{job.role}</p>
                    <p className="text-xs text-muted">{job.type}</p>
                  </div>
                  <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                    {job.status.replace('Matched', 'Kecocokan')}
                  </span>
                </article>
              ))}
            </div>
            <div className="mt-4">
              <EmptyImageSlot src={landingImageSources.careerBoard} alt="Career match board image" />
            </div>
          </div>
        </div>
      </section>

      <section id="manfaat" className="mx-auto w-full max-w-6xl px-6 py-18">
        <SectionHeader
          title="Langkahmu Sampai Siap Kerja"
          subtitle="Ikuti alur sederhana ini untuk naik dari tahap belajar ke tahap melamar kerja dengan lebih percaya diri."
          align="center"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {journeySteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-border bg-surface p-5">
              <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {index + 1}
              </p>
              <h3 className="mt-3 font-heading text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <SectionHeader
              title="Cerita Pengguna"
              subtitle="Pengguna merasakan progres yang lebih terarah karena tahu skill apa yang perlu dikejar duluan."
            />
            <div className="mt-5 space-y-3">
              {successStories.map((story) => (
                <article key={story.name} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="text-sm text-muted">"{story.story}"</p>
                  <p className="mt-3 font-semibold text-ink">{story.name}</p>
                  <p className="text-xs text-muted">{story.role}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <EmptyImageSlot src={landingImageSources.successStory} alt="Success story image" />
            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Mentor Review Session</p>
              <p className="mt-1 text-sm text-ink">
                Sesi mentoring 1-on-1 bantu kamu memvalidasi CV, portofolio, dan strategi apply kerja.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-18">
        <div className="rounded-[2rem] bg-ink px-6 py-8 text-white md:px-10 md:py-11">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Siap mulai belajar?
          </p>
          <h2 className="mt-2 max-w-3xl font-heading text-3xl font-semibold md:text-4xl">
            Mulai asesmen sekarang, lalu jalankan jalur belajarmu sampai siap melamar.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Kamu akan dapat rekomendasi role, peta skill gap, dan training personal yang relevan dengan
            kebutuhan industri saat ini.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/assessment"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
            >
              Mulai Asesmen
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/18"
            >
              Lihat Learning Tracks
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
