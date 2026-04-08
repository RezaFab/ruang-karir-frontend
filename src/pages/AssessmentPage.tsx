import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AssessmentHistoryCard,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  ProgressStepper,
  SectionHeader,
} from '../components'
import {
  useCareerGoalsQuery,
  useMyAssessmentsQuery,
  useSubmitAssessmentMutation,
} from '../hooks/useCareerApi'
import { useAssessmentStore } from '../store'
import { type AssessmentStep, assessmentStepLabels, industryOptions, skillSuggestions, validateAssessmentStep } from '../utils'

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const draft = useAssessmentStore((state) => state.draft)
  const updateBasicProfile = useAssessmentStore((state) => state.updateBasicProfile)
  const updateWorkPreferences = useAssessmentStore((state) => state.updateWorkPreferences)
  const setExistingSkills = useAssessmentStore((state) => state.setExistingSkills)
  const updateExperience = useAssessmentStore((state) => state.updateExperience)
  const setCareerGoalId = useAssessmentStore((state) => state.setCareerGoalId)
  const updateLearningPreferences = useAssessmentStore((state) => state.updateLearningPreferences)
  const setLatestAssessmentId = useAssessmentStore((state) => state.setLatestAssessmentId)
  const setSelectedCareerGoalId = useAssessmentStore((state) => state.setSelectedCareerGoalId)

  const {
    data: careerGoals,
    isLoading: goalsLoading,
    isError: goalsError,
    refetch: refetchGoals,
  } = useCareerGoalsQuery()
  const {
    data: assessmentHistory,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorObject,
    refetch: refetchHistory,
  } = useMyAssessmentsQuery()

  const submitMutation = useSubmitAssessmentMutation()

  const completionPercent = useMemo(
    () => Math.round(((currentStep + 1) / assessmentStepLabels.length) * 100),
    [currentStep],
  )
  const sortedAssessmentHistory = useMemo(
    () =>
      [...(assessmentHistory ?? [])].sort((first, second) =>
        second.submittedAt.localeCompare(first.submittedAt),
      ),
    [assessmentHistory],
  )
  const latestAssessment = sortedAssessmentHistory[0]
  const careerGoalTitleMap = useMemo(
    () => new Map((careerGoals ?? []).map((goal) => [goal.id, goal.title])),
    [careerGoals],
  )
  const historyErrorMessage =
    historyErrorObject instanceof Error
      ? historyErrorObject.message
      : 'Riwayat asesmen belum tersedia dari backend.'

  function toggleIndustry(industry: string) {
    const exists = draft.workPreferences.preferredIndustries.includes(industry)

    if (exists) {
      updateWorkPreferences({
        preferredIndustries: draft.workPreferences.preferredIndustries.filter((item) => item !== industry),
      })
      return
    }

    updateWorkPreferences({
      preferredIndustries: [...draft.workPreferences.preferredIndustries, industry],
    })
  }

  function toggleSkill(skill: string) {
    const exists = draft.existingSkills.includes(skill)

    if (exists) {
      setExistingSkills(draft.existingSkills.filter((item) => item !== skill))
      return
    }

    setExistingSkills([...draft.existingSkills, skill])
  }

  function handleNext() {
    const validationErrors = validateAssessmentStep(currentStep as AssessmentStep, draft)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  function handlePrevious() {
    setErrors({})
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  function handleSubmit() {
    const validationErrors = validateAssessmentStep(5, draft)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    submitMutation.mutate(
      { assessment: draft },
      {
        onSuccess: (response) => {
          setLatestAssessmentId(response.assessmentId)
          setSelectedCareerGoalId(draft.careerGoalId)
          navigate(`/assessment/result?assessmentId=${response.assessmentId}`)
        },
      },
    )
  }

  function handleOpenResult(assessmentId: string, careerGoalId?: string) {
    setLatestAssessmentId(assessmentId)
    setSelectedCareerGoalId(careerGoalId)
    navigate(`/assessment/result?assessmentId=${assessmentId}`)
  }

  return (
    <section className="space-y-8">
      <SectionHeader
        title="Asesmen Karier"
        subtitle="Isi asesmen bertahap untuk menghasilkan rekomendasi karier dan jalur belajar personal."
      />

      <article className="rounded-3xl border border-border bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] p-6 text-white shadow-[0_20px_40px_rgba(15,39,64,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Onboarding Karier</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">Mulai dari profilmu, berakhir di jalur kerja nyata</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/90">
          Form asesmen ini dipakai AI untuk memetakan kesiapan, memilih role paling cocok, dan menyusun kurikulum belajar yang relevan dengan kebutuhan industri.
        </p>
      </article>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-ink">Riwayat Asesmen</h2>
            <p className="mt-1 text-sm text-muted">
              Jika sudah pernah isi, kamu bisa lanjutkan dari hasil terakhir.
            </p>
          </div>
          {latestAssessment ? (
            <button
              type="button"
              onClick={() => handleOpenResult(latestAssessment.assessmentId, latestAssessment.careerGoalId)}
              className="rounded-xl border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
            >
              Lanjutkan Hasil Terakhir
            </button>
          ) : null}
        </div>

        {historyLoading ? <LoadingSkeleton lines={3} /> : null}

        {historyError ? (
          <ErrorState
            title="Riwayat asesmen belum bisa dimuat"
            description={historyErrorMessage}
            onRetry={() => {
              void refetchHistory()
            }}
          />
        ) : null}

        {!historyLoading && !historyError && sortedAssessmentHistory.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat asesmen"
            description="Silakan isi asesmen pertama kamu di form bawah ini."
          />
        ) : null}

        {!historyLoading && !historyError && sortedAssessmentHistory.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sortedAssessmentHistory.map((item, index) => (
              <AssessmentHistoryCard
                key={item.assessmentId}
                item={item}
                isLatest={index === 0}
                careerGoalTitle={
                  item.careerGoalId ? careerGoalTitleMap.get(item.careerGoalId) : undefined
                }
                onOpenResult={handleOpenResult}
              />
            ))}
          </div>
        ) : null}
      </section>

      <div className="rounded-2xl border border-border bg-white p-5">
        <ProgressStepper steps={assessmentStepLabels} currentStep={currentStep} />
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#50b8a5,#0e1e2e)] transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Kemajuan {completionPercent}%
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        {currentStep === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Nama lengkap</span>
              <input
                value={draft.basicProfile.fullName}
                onChange={(event) => updateBasicProfile({ fullName: event.target.value })}
                placeholder="Contoh: Reza Lesmana"
                className="input-field"
              />
              {errors.fullName ? <span className="text-xs text-danger">{errors.fullName}</span> : null}
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Email</span>
              <input
                type="email"
                value={draft.basicProfile.email}
                onChange={(event) => updateBasicProfile({ email: event.target.value })}
                placeholder="nama@email.com"
                className="input-field"
              />
              {errors.email ? <span className="text-xs text-danger">{errors.email}</span> : null}
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Role saat ini</span>
              <input
                value={draft.basicProfile.currentRole}
                onChange={(event) => updateBasicProfile({ currentRole: event.target.value })}
                placeholder="Contoh: Admin Operasional"
                className="input-field"
              />
              {errors.currentRole ? <span className="text-xs text-danger">{errors.currentRole}</span> : null}
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Pendidikan terakhir</span>
              <input
                value={draft.basicProfile.educationLevel}
                onChange={(event) => updateBasicProfile({ educationLevel: event.target.value })}
                placeholder="Contoh: S1 Manajemen"
                className="input-field"
              />
              {errors.educationLevel ? (
                <span className="text-xs text-danger">{errors.educationLevel}</span>
              ) : null}
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-ink">Kota domisili</span>
              <input
                value={draft.basicProfile.city}
                onChange={(event) => updateBasicProfile({ city: event.target.value })}
                placeholder="Contoh: Bandung"
                className="input-field"
              />
              {errors.city ? <span className="text-xs text-danger">{errors.city}</span> : null}
            </label>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-ink">Mode kerja</span>
                <select
                  value={draft.workPreferences.workMode}
                  onChange={(event) =>
                    updateWorkPreferences({
                      workMode: event.target.value as 'remote' | 'hybrid' | 'onsite',
                    })
                  }
                  className="input-field"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-ink">Tipe kerja</span>
                <select
                  value={draft.workPreferences.jobType}
                  onChange={(event) =>
                    updateWorkPreferences({
                      jobType: event.target.value as 'full-time' | 'contract' | 'freelance',
                    })
                  }
                  className="input-field"
                >
                  <option value="full-time">Full-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">Industri yang diminati</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {industryOptions.map((industry) => {
                  const active = draft.workPreferences.preferredIndustries.includes(industry)

                  return (
                    <button
                      type="button"
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active ? 'border-primary bg-primary-soft text-primary' : 'border-border text-muted'
                      }`}
                    >
                      {industry}
                    </button>
                  )
                })}
              </div>
              {errors.preferredIndustries ? (
                <p className="mt-2 text-xs text-danger">{errors.preferredIndustries}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div>
            <p className="text-sm font-medium text-ink">Skill yang sudah dimiliki</p>
            <p className="mt-1 text-sm text-muted">Pilih minimal 2 skill.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillSuggestions.map((skill) => {
                const active = draft.existingSkills.includes(skill)

                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active ? 'border-primary bg-primary-soft text-primary' : 'border-border text-muted'
                    }`}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
            {errors.existingSkills ? (
              <p className="mt-2 text-xs text-danger">{errors.existingSkills}</p>
            ) : null}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Pengalaman kerja (tahun)</span>
              <input
                type="number"
                min={0}
                value={draft.experience.years}
                onChange={(event) => updateExperience({ years: Number(event.target.value) })}
                className="input-field"
              />
              {errors.years ? <span className="text-xs text-danger">{errors.years}</span> : null}
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-ink">Highlight pengalaman/proyek</span>
              <textarea
                value={draft.experience.highlights}
                onChange={(event) => updateExperience({ highlights: event.target.value })}
                rows={4}
                placeholder="Jelaskan pengalaman paling relevan untuk transisi karier kamu"
                className="input-field"
              />
              {errors.highlights ? <span className="text-xs text-danger">{errors.highlights}</span> : null}
            </label>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-4">
            <SectionHeader
              title="Tujuan Karier (Opsional)"
              subtitle="Jika belum yakin, kosongkan. AI akan rekomendasikan beberapa opsi karier terbaik."
            />

            {goalsLoading ? <LoadingSkeleton lines={4} /> : null}
            {goalsError ? (
              <ErrorState
                title="Gagal memuat career goals"
                onRetry={() => {
                  void refetchGoals()
                }}
              />
            ) : null}

            {!goalsLoading && !goalsError && careerGoals?.length === 0 ? (
              <EmptyState
                title="Tujuan karier belum tersedia"
                description="Silakan lanjutkan tanpa memilih tujuan."
              />
            ) : null}

            {!goalsLoading && !goalsError && careerGoals?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCareerGoalId(undefined)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    !draft.careerGoalId ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
                  }`}
                >
                  <h3 className="font-heading text-lg font-semibold text-ink">Belum Punya Tujuan</h3>
                  <p className="mt-1 text-sm text-muted">
                    Biarkan AI memilihkan beberapa role paling cocok lebih dulu.
                  </p>
                </button>

                {careerGoals.map((goal) => (
                  <button
                    type="button"
                    key={goal.id}
                    onClick={() => setCareerGoalId(goal.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      draft.careerGoalId === goal.id
                        ? 'border-primary bg-primary-soft'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <h3 className="font-heading text-lg font-semibold text-ink">{goal.title}</h3>
                    <p className="mt-1 text-sm text-muted">{goal.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">
                      Demand {goal.demandScore} | Transisi min {goal.minimumTransitionMonths} bulan
                    </p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Pace belajar</span>
              <select
                value={draft.learningPreferences.pace}
                onChange={(event) =>
                  updateLearningPreferences({
                    pace: event.target.value as 'intensive' | 'balanced' | 'light',
                  })
                }
                className="input-field"
              >
                <option value="intensive">Intensive</option>
                <option value="balanced">Balanced</option>
                <option value="light">Light</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-ink">Alokasi jam belajar / minggu</span>
              <input
                type="number"
                min={1}
                value={draft.learningPreferences.weeklyHours}
                onChange={(event) =>
                  updateLearningPreferences({ weeklyHours: Number(event.target.value) })
                }
                className="input-field"
              />
              {errors.weeklyHours ? <span className="text-xs text-danger">{errors.weeklyHours}</span> : null}
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-ink">Gaya belajar favorit</span>
              <select
                value={draft.learningPreferences.style}
                onChange={(event) =>
                  updateLearningPreferences({
                    style: event.target.value as 'video' | 'project' | 'mixed',
                  })
                }
                className="input-field"
              >
                <option value="video">Video-first</option>
                <option value="project">Project-based</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:text-ink"
        >
          Kembali ke Landing
        </Link>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0 || submitMutation.isPending}
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sebelumnya
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitMutation.isPending ? 'Mengirim...' : 'Kirim Asesmen'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
