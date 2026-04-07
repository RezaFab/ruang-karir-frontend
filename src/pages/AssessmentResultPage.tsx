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
        title="Belum ada hasil assessment"
        description="Silakan isi assessment dulu untuk mendapatkan rekomendasi karier."
        action={
          <Link
            to="/assessment"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Mulai Assessment
          </Link>
        }
      />
    )
  }

  const result = recommendationMutation.data

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Assessment Result"
        subtitle="AI menganalisis profil, skill, preferensi, dan tren industri untuk menyusun rekomendasi karier personal."
      />

      {recommendationMutation.isPending ? <LoadingSkeleton lines={6} /> : null}

      {recommendationMutation.isError ? (
        <ErrorState
          title="Gagal memuat hasil assessment"
          description="Silakan coba generate ulang rekomendasi."
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
          <article className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-semibold text-ink">Ringkasan AI Insight</h2>
            <p className="mt-2 text-sm text-muted">{result.reasoning}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Strengths</p>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {result.skillGapSummary.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Skill Gap</p>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {result.skillGapSummary.missingSkills.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-muted">
                  Urgency {result.skillGapSummary.urgency}
                </p>
              </div>
            </div>
          </article>

          {result.mode === 'need-goal-selection' ? (
            <section className="space-y-4">
              <SectionHeader
                title="Pilih Rekomendasi Karier"
                subtitle="Pilih salah satu role untuk menghasilkan learning path detail."
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
                  Generate Learning Path
                </button>
                <Link
                  to="/assessment"
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  Edit Assessment
                </Link>
              </div>
            </section>
          ) : null}

          {result.mode === 'direct-path' ? (
            <section className="rounded-2xl border border-success/50 bg-success-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-success">Learning Path Ready</p>
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
                  Lihat Learning Path Detail
                </button>
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  Buka Progress Dashboard
                </Link>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
