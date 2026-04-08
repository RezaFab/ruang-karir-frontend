import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CareerRecommendationCard, EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useRecommendationMutation } from '../hooks/useCareerApi'
import { useAssessmentStore } from '../store'

const recommendationPageSizeOptions = [10, 25, 50, 100] as const

export default function AssessmentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const latestAssessmentId = useAssessmentStore((state) => state.latestAssessmentId)
  const selectedCareerGoalId = useAssessmentStore((state) => state.selectedCareerGoalId)
  const setSelectedCareerGoalId = useAssessmentStore((state) => state.setSelectedCareerGoalId)

  const assessmentId = searchParams.get('assessmentId') ?? latestAssessmentId
  const [pendingSelectionId, setPendingSelectionId] = useState<string | undefined>(selectedCareerGoalId)
  const [recommendationSearchInput, setRecommendationSearchInput] = useState('')
  const [showRecommendationFilters, setShowRecommendationFilters] = useState(false)
  const [minMatchScoreFilter, setMinMatchScoreFilter] = useState<0 | 70 | 85>(0)
  const [recommendationPage, setRecommendationPage] = useState(1)
  const [recommendationPageSize, setRecommendationPageSize] = useState<number>(recommendationPageSizeOptions[0])
  const hasRequestedInitial = useRef(false)

  const recommendationMutation = useRecommendationMutation()

  useEffect(() => {
    if (!assessmentId || hasRequestedInitial.current) {
      return
    }

    hasRequestedInitial.current = true

    recommendationMutation.mutate({
      assessmentId,
      selectedCareerGoalId,
    })
  }, [assessmentId, recommendationMutation, selectedCareerGoalId])

  function requestFinalPath() {
    if (!assessmentId || !pendingSelectionId) {
      return
    }

    setSelectedCareerGoalId(pendingSelectionId)

    recommendationMutation.mutate({
      assessmentId,
      selectedCareerGoalId: pendingSelectionId,
    })
  }

  const result = recommendationMutation.data
  const recommendationList = useMemo(() => {
    if (!result || result.mode !== 'need-goal-selection') {
      return []
    }

    const normalizedSearch = recommendationSearchInput.trim().toLowerCase()

    return result.recommendations.filter((recommendation) => {
      if (recommendation.matchScore < minMatchScoreFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableText = [
        recommendation.title,
        ...recommendation.reasons,
        ...recommendation.keySkillsToBuild,
      ]
        .join(' ')
        .toLowerCase()
      return searchableText.includes(normalizedSearch)
    })
  }, [minMatchScoreFilter, recommendationSearchInput, result])
  const recommendationTotalItems = recommendationList.length
  const recommendationTotalPages = Math.max(1, Math.ceil(recommendationTotalItems / recommendationPageSize))
  const activeRecommendationPage = Math.min(recommendationPage, recommendationTotalPages)
  const paginatedRecommendations = useMemo(() => {
    const startIndex = (activeRecommendationPage - 1) * recommendationPageSize
    return recommendationList.slice(startIndex, startIndex + recommendationPageSize)
  }, [activeRecommendationPage, recommendationList, recommendationPageSize])

  function handleRecommendationSearchChange(value: string) {
    setRecommendationSearchInput(value)
    setRecommendationPage(1)
  }

  function handleRecommendationPageSizeChange(value: number) {
    setRecommendationPageSize(value)
    setRecommendationPage(1)
  }

  function handleRecommendationMatchScoreFilter(value: 0 | 70 | 85) {
    setMinMatchScoreFilter(value)
    setRecommendationPage(1)
  }

  function handleRecommendationPreviousPage() {
    if (activeRecommendationPage <= 1) {
      return
    }

    setRecommendationPage(activeRecommendationPage - 1)
  }

  function handleRecommendationNextPage() {
    if (activeRecommendationPage >= recommendationTotalPages) {
      return
    }

    setRecommendationPage(activeRecommendationPage + 1)
  }

  if (!assessmentId) {
    return (
      <EmptyState
        title="Belum ada hasil asesmen"
        description="Silakan isi asesmen dulu untuk mendapatkan rekomendasi karier."
        action={
          <Link
            to="/assessment"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Mulai Asesmen
          </Link>
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Hasil Asesmen"
        subtitle="AI menganalisis profil, skill, preferensi, dan tren industri untuk menyusun rekomendasi karier personal."
      />

      {recommendationMutation.isPending ? <LoadingSkeleton lines={6} /> : null}

      {recommendationMutation.isError ? (
        <ErrorState
          title="Gagal memuat hasil asesmen"
          description="Silakan coba buat ulang rekomendasi."
          onRetry={() => {
            recommendationMutation.mutate({
              assessmentId,
              selectedCareerGoalId: pendingSelectionId,
            })
          }}
        />
      ) : null}

      {!recommendationMutation.isPending && !recommendationMutation.isError && result ? (
        <>
          <article className="rounded-3xl border border-border bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] p-6 text-white shadow-[0_20px_45px_rgba(15,39,64,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Insight Karier AI</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold">
              {result.mode === 'direct-path' ? result.selectedCareerGoal.title : 'Rekomendasi Multi-Role'}
            </h2>
            <p className="mt-2 text-sm text-white/90">{result.reasoning}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Kekuatan</p>
                <ul className="mt-2 space-y-1 text-sm text-white">
                  {result.skillGapSummary.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Kesenjangan Skill</p>
                <ul className="mt-2 space-y-1 text-sm text-white">
                  {result.skillGapSummary.missingSkills.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-white/75">
                  Tingkat Urgensi {result.skillGapSummary.urgency}
                </p>
              </div>
            </div>
          </article>

          {result.mode === 'need-goal-selection' ? (
            <section className="space-y-4">
              <SectionHeader
                title="Pilih Rekomendasi Karier"
                subtitle="Pilih salah satu peran untuk menghasilkan jalur belajar detail."
              />

              <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <label className="w-full max-w-xl space-y-1.5 text-sm">
                    <span className="font-medium text-ink">Cari rekomendasi</span>
                    <input
                      value={recommendationSearchInput}
                      onChange={(event) => handleRecommendationSearchChange(event.target.value)}
                      placeholder="Cari role atau skill utama"
                      className="input-field"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowRecommendationFilters((previous) => !previous)}
                    className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
                  >
                    {showRecommendationFilters ? 'Tutup Filter' : 'Filter'}
                  </button>
                </div>

                {showRecommendationFilters ? (
                  <div className="rounded-xl border border-border bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      Minimum Match Score
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {([0, 70, 85] as const).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleRecommendationMatchScoreFilter(score)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            minMatchScoreFilter === score
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-border text-muted hover:bg-panel'
                          }`}
                        >
                          {score === 0 ? 'Semua' : `${score}+`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              {recommendationTotalItems === 0 ? (
                <EmptyState
                  title="Tidak ada rekomendasi yang cocok"
                  description="Coba ubah kata kunci pencarian."
                />
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedRecommendations.map((recommendation) => (
                      <CareerRecommendationCard
                        key={recommendation.careerGoalId}
                        recommendation={recommendation}
                        isSelected={pendingSelectionId === recommendation.careerGoalId}
                        onSelect={(careerGoalId) => setPendingSelectionId(careerGoalId)}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-3 text-muted">
                      <label className="flex items-center">
                        <select
                          value={recommendationPageSize}
                          onChange={(event) => handleRecommendationPageSizeChange(Number(event.target.value))}
                          aria-label="Jumlah data per halaman"
                          className="input-field min-w-[100px] py-1.5"
                        >
                          {recommendationPageSizeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span>
                        Menampilkan {paginatedRecommendations.length} dari {recommendationTotalItems} rekomendasi
                        | Halaman {activeRecommendationPage}/{recommendationTotalPages}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRecommendationPreviousPage}
                        disabled={activeRecommendationPage <= 1}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={handleRecommendationNextPage}
                        disabled={activeRecommendationPage >= recommendationTotalPages}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={requestFinalPath}
                  disabled={!pendingSelectionId || recommendationMutation.isPending}
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Buat Jalur Belajar
                </button>
                <Link
                  to="/assessment"
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  Ubah Asesmen
                </Link>
              </div>
            </section>
          ) : null}

          {result.mode === 'direct-path' ? (
            <section className="rounded-2xl border border-success/50 bg-success-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-success">Jalur Belajar Siap</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-ink">
                Target Karier: {result.selectedCareerGoal.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{result.selectedCareerGoal.description}</p>
              <p className="mt-3 text-sm text-muted">{result.skillGapSummary.note}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/learning-path/${result.learningPathId}`)}
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Lihat Detail Jalur Belajar
                </button>
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  Buka Dasbor Progres
                </Link>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
