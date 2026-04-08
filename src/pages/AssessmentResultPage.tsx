import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CareerRecommendationCard, EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useRecommendationMutation } from '../hooks/useCareerApi'
import { useAssessmentStore } from '../store'

export default function AssessmentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const latestAssessmentId = useAssessmentStore((state) => state.latestAssessmentId)
  const selectedCareerGoalId = useAssessmentStore((state) => state.selectedCareerGoalId)
  const setSelectedCareerGoalId = useAssessmentStore((state) => state.setSelectedCareerGoalId)

  const assessmentId = searchParams.get('assessmentId') ?? latestAssessmentId
  const [pendingSelectionId, setPendingSelectionId] = useState<string | undefined>(selectedCareerGoalId)
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

  const result = recommendationMutation.data

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

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.recommendations.map((recommendation) => (
                  <CareerRecommendationCard
                    key={recommendation.careerGoalId}
                    recommendation={recommendation}
                    isSelected={pendingSelectionId === recommendation.careerGoalId}
                    onSelect={(careerGoalId) => setPendingSelectionId(careerGoalId)}
                  />
                ))}
              </div>

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
