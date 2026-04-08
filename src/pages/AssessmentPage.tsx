import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  useCreateSkillMutation,
  useMyAssessmentsQuery,
  useSkillsQuery,
  useSubmitAssessmentMutation,
} from '../hooks/useCareerApi'
import { useAssessmentStore, useSessionStore } from '../store'
import {
  type AssessmentStep,
  assessmentStepLabels,
  dedupeSkillNames,
  industryOptions,
  normalizeSkillName,
  toSkillKey,
  validateAssessmentStep,
} from '../utils'

const skillLengthOptions = [10, 20, 50] as const

function parsePositiveIntParam(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

function parseSkillLengthParam(value: string | null, fallback: number): number {
  const parsed = parsePositiveIntParam(value, fallback)
  if (skillLengthOptions.includes(parsed as (typeof skillLengthOptions)[number])) {
    return parsed
  }

  return fallback
}

function formatSkillDate(value: string): string {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    return '-'
  }

  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialSkillSearch = searchParams.get('search') ?? ''
  const initialSkillPage = parsePositiveIntParam(searchParams.get('page'), 1)
  const initialSkillLength = parseSkillLengthParam(searchParams.get('length'), 20)

  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [skillSearchInput, setSkillSearchInput] = useState(initialSkillSearch)
  const [debouncedSkillSearch, setDebouncedSkillSearch] = useState(initialSkillSearch)
  const [skillPage, setSkillPage] = useState(initialSkillPage)
  const [skillLength, setSkillLength] = useState(initialSkillLength)
  const [skillActionError, setSkillActionError] = useState('')
  const activeRole = useSessionStore((state) => state.activeRole)
  const isAdminSkillTableVisible = activeRole === 'admin'

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
  const createSkillMutation = useCreateSkillMutation()
  const {
    data: skillCatalog,
    isLoading: skillCatalogLoading,
    isFetching: skillCatalogFetching,
    isError: skillCatalogError,
    error: skillCatalogErrorObject,
  } = useSkillsQuery(
    {
      search: debouncedSkillSearch,
      page: isAdminSkillTableVisible ? skillPage : 1,
      length: isAdminSkillTableVisible ? skillLength : 10,
    },
    currentStep === 2 && (isAdminSkillTableVisible || debouncedSkillSearch.length > 0),
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSkillSearch(skillSearchInput.trim())
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [skillSearchInput])

  useEffect(() => {
    if (!isAdminSkillTableVisible) {
      return
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      const normalizedSearch = skillSearchInput.trim()

      if (normalizedSearch) {
        next.set('search', normalizedSearch)
      } else {
        next.delete('search')
      }

      next.set('page', String(skillPage))
      next.set('length', String(skillLength))

      if (next.toString() === previous.toString()) {
        return previous
      }

      return next
    }, { replace: true })
  }, [isAdminSkillTableVisible, setSearchParams, skillLength, skillPage, skillSearchInput])

  const completionPercent = useMemo(
    () => Math.round(((currentStep + 1) / assessmentStepLabels.length) * 100),
    [currentStep],
  )
  const showSkillDropdown = skillSearchInput.trim().length > 0
  const skillCatalogItems = useMemo(() => skillCatalog?.items ?? [], [skillCatalog])
  const skillCatalogPagination = skillCatalog?.pagination
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
      : 'Riwayat asesmen belum tersedia.'

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
    const normalizedSkill = normalizeSkillName(skill)
    const existingSkillIndex = draft.existingSkills.findIndex(
      (item) => toSkillKey(item) === toSkillKey(normalizedSkill),
    )

    if (existingSkillIndex >= 0) {
      setExistingSkills(draft.existingSkills.filter((_, index) => index !== existingSkillIndex))
      clearExistingSkillsValidationError()
      return
    }

    setExistingSkills([...draft.existingSkills, normalizedSkill])
    clearExistingSkillsValidationError()
  }

  function clearExistingSkillsValidationError() {
    setErrors((previous) => {
      if (!previous.existingSkills) {
        return previous
      }

      const rest = { ...previous }
      delete rest.existingSkills
      return rest
    })
  }

  function addMatchedSkill(skill: string) {
    const normalizedSkill = normalizeSkillName(skill)

    if (!normalizedSkill) {
      return
    }

    const isDuplicated = draft.existingSkills.some(
      (existingSkill) => toSkillKey(existingSkill) === toSkillKey(normalizedSkill),
    )

    if (isDuplicated) {
      setSkillSearchInput('')
      return
    }

    setExistingSkills(dedupeSkillNames([...draft.existingSkills, normalizedSkill]))
    setSkillSearchInput('')
    setSkillActionError('')
    clearExistingSkillsValidationError()
  }

  async function addNewSkillFromInput() {
    const normalizedSkill = normalizeSkillName(skillSearchInput)

    if (!normalizedSkill) {
      return
    }

    const isDuplicated = draft.existingSkills.some(
      (existingSkill) => toSkillKey(existingSkill) === toSkillKey(normalizedSkill),
    )

    if (isDuplicated) {
      setSkillSearchInput('')
      setSkillActionError('')
      return
    }

    try {
      const createdSkill = await createSkillMutation.mutateAsync({ name: normalizedSkill })
      addMatchedSkill(createdSkill.name)
    } catch (error) {
      setSkillActionError(error instanceof Error ? error.message : 'Gagal menambahkan skill.')
    }
  }

  async function handleSkillSearchEnter() {
    const normalizedSkill = normalizeSkillName(skillSearchInput)

    if (!normalizedSkill) {
      return
    }

    const matchedSkill = skillCatalogItems.find(
      (skill) => toSkillKey(skill.name) === toSkillKey(normalizedSkill),
    )

    if (matchedSkill) {
      addMatchedSkill(matchedSkill.name)
      return
    }

    await addNewSkillFromInput()
  }

  function handleSkillInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    void handleSkillSearchEnter()
  }

  function handleSkillSearchChange(value: string) {
    setSkillSearchInput(value)
    if (skillActionError) {
      setSkillActionError('')
    }
    setSkillPage(1)
  }

  function handleSkillLengthChange(value: number) {
    setSkillLength(value)
    setSkillPage(1)
  }

  function handleSkillPreviousPage() {
    if (!skillCatalogPagination?.hasPrevPage) {
      return
    }

    setSkillPage((previous) => Math.max(previous - 1, 1))
  }

  function handleSkillNextPage() {
    if (!skillCatalogPagination?.hasNextPage) {
      return
    }

    setSkillPage((previous) => previous + 1)
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

    const normalizedSkills = dedupeSkillNames(draft.existingSkills)
    const assessmentPayload = {
      ...draft,
      existingSkills: normalizedSkills,
    }

    if (normalizedSkills.length !== draft.existingSkills.length) {
      setExistingSkills(normalizedSkills)
    }

    submitMutation.mutate(
      { assessment: assessmentPayload },
      {
        onSuccess: (response) => {
          setLatestAssessmentId(response.assessmentId)
          setSelectedCareerGoalId(assessmentPayload.careerGoalId)
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
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-ink">Skill yang sudah dimiliki</p>
              <p className="mt-1 text-sm text-muted">Cari dan pilih skill yang tersedia. Minimal 2 skill.</p>
            </div>

            <div className="space-y-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-ink">Cari skill pelamar</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted/80">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                    >
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    value={skillSearchInput}
                    onChange={(event) => handleSkillSearchChange(event.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder="Ketik skill"
                    className="input-field !pl-12"
                    style={{ paddingLeft: '3rem' }}
                  />

                  {showSkillDropdown ? (
                    <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
                      {skillCatalogLoading || skillCatalogFetching ? (
                        <p className="px-3 py-2 text-sm text-muted">Mencari...</p>
                      ) : skillCatalogItems.length > 0 ? (
                        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                          {skillCatalogItems.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => addMatchedSkill(skill.name)}
                              className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-surface"
                            >
                              <span className="text-sm font-medium text-ink">{skill.name}</span>
                              <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium text-muted">
                                {skill.usageCount} orang punya skill ini
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            void addNewSkillFromInput()
                          }}
                          disabled={createSkillMutation.isPending}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-primary transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {createSkillMutation.isPending
                            ? 'Menambahkan skill...'
                            : 'Tambah skill (belum tersedia)'}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </label>
            </div>
            {skillActionError ? <p className="text-xs text-danger">{skillActionError}</p> : null}
            {skillCatalogError ? (
              <p className="text-xs text-danger">
                {skillCatalogErrorObject instanceof Error
                  ? skillCatalogErrorObject.message
                  : 'Skill katalog belum tersedia.'}
              </p>
            ) : null}

            {isAdminSkillTableVisible ? (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      Admin - Daftar Skill
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Tabel ini khusus admin untuk memonitor daftar skill yang tersimpan.
                    </p>
                  </div>

                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-ink">Jumlah per halaman</span>
                    <select
                      value={skillLength}
                      onChange={(event) => handleSkillLengthChange(Number(event.target.value))}
                      className="input-field min-w-[120px]"
                    >
                      {skillLengthOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Usage</th>
                        <th className="px-3 py-2">Source</th>
                        <th className="px-3 py-2">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skillCatalogItems.map((skill, index) => {
                        const pageValue = skillCatalogPagination?.page ?? skillPage
                        const lengthValue = skillCatalogPagination?.length ?? skillLength
                        const rowNumber = (pageValue - 1) * lengthValue + index + 1

                        return (
                          <tr key={skill.id} className="border-t border-border">
                            <td className="px-3 py-2 text-muted">{rowNumber}</td>
                            <td className="px-3 py-2 font-medium text-ink">{skill.name}</td>
                            <td className="px-3 py-2 text-muted">{skill.usageCount}</td>
                            <td className="px-3 py-2 text-muted">{skill.source}</td>
                            <td className="px-3 py-2 text-muted">{formatSkillDate(skill.createdAt)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="text-muted">
                    Total {skillCatalogPagination?.total ?? 0} | Halaman{' '}
                    {skillCatalogPagination?.page ?? skillPage}/
                    {Math.max(skillCatalogPagination?.totalPages ?? 1, 1)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSkillPreviousPage}
                      disabled={!skillCatalogPagination?.hasPrevPage || skillCatalogFetching}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={handleSkillNextPage}
                      disabled={!skillCatalogPagination?.hasNextPage || skillCatalogFetching}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Skill terpilih ({draft.existingSkills.length})
              </p>
              {draft.existingSkills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {draft.existingSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-sm text-primary transition hover:border-primary hover:bg-white"
                    >
                      {skill} <span aria-hidden="true">x</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">Belum ada skill dipilih.</p>
              )}
            </div>

            {errors.existingSkills ? (
              <p className="mt-2 text-xs text-danger">{errors.existingSkills}</p>
            ) : null}
            <p className="text-xs text-muted">
              Semua skill yang kamu pilih akan ikut tersimpan saat klik <span className="font-semibold">Kirim Asesmen</span>.
            </p>
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
