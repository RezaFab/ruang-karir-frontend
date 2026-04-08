import type { CareerApiService } from './apiService'
import {
  mockCompanyJobPosts,
  mockAssessmentAnswers,
  mockBadges,
  mockCareerGoals,
  mockCareerRecommendations,
  mockCompanyCandidates,
  mockIndustryTrends,
  mockJobRecommendations,
  mockJobSearchInsight,
  mockLearningPaths,
  mockProgressSummaries,
  mockSkillGapByCareerGoal,
  mockUserProfile,
} from '../mocks/data'
import {
  calculateCompletionRate,
  cloneDeep,
  createApiResponse,
  withDelay,
} from '../mocks/helpers'
import type {
  AssessmentHistoryItem,
  AssessmentDraft,
  CreateCompanyJobPostRequest,
  CreateCompanyJobPostResponse,
  GetBadgesResponse,
  GetCareerGoalsResponse,
  GetCompanyJobPostsResponse,
  GetCompanyCandidatesResponse,
  GetIndustryTrendsResponse,
  GetJobRecommendationsResponse,
  GetLearningPathResponse,
  GetMyAssessmentsResponse,
  GetProgressSummaryResponse,
  GetUserProfileResponse,
  RecommendationRequest,
  RecommendationResponse,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  UpdateLearningProgressRequest,
  UpdateLearningProgressResponse,
} from '../types'

const assessmentMap = new Map<string, AssessmentDraft>()
const learningPathState = cloneDeep(mockLearningPaths)
const progressSummaryState = cloneDeep(mockProgressSummaries)
let badgesState = cloneDeep(mockBadges)
let companyJobsState = cloneDeep(mockCompanyJobPosts)

function toAssessmentHistoryItem(
  assessmentId: string,
  assessment: AssessmentDraft,
  submittedAt: string,
): AssessmentHistoryItem {
  return {
    assessmentId,
    submittedAt,
    hasCareerGoal: Boolean(assessment.careerGoalId),
    careerGoalId: assessment.careerGoalId,
    currentRole: assessment.basicProfile.currentRole,
    learningPace: assessment.learningPreferences.pace,
    workMode: assessment.workPreferences.workMode,
    jobType: assessment.workPreferences.jobType,
    preferredIndustries: cloneDeep(assessment.workPreferences.preferredIndustries),
    existingSkills: cloneDeep(assessment.existingSkills),
  }
}

const assessmentHistoryState: AssessmentHistoryItem[] = [
  toAssessmentHistoryItem('assessment-default', mockAssessmentAnswers, '2026-04-06T10:30:00.000Z'),
]

assessmentMap.set('assessment-default', cloneDeep(mockAssessmentAnswers))

function generateAssessmentId(): string {
  return `assessment-${Math.random().toString(36).slice(2, 10)}`
}

function resolveProgressSummary(learningPathId: string) {
  const storedSummary = progressSummaryState.find((item) => item.learningPathId === learningPathId)

  if (storedSummary) {
    return storedSummary
  }

  const path = learningPathState.find((item) => item.id === learningPathId)
  const completedModules = path?.modules.filter((module) => module.isCompleted).length ?? 0
  const totalModules = path?.modules.length ?? 0

  return {
    learningPathId,
    completedModules,
    totalModules,
    completionRate: calculateCompletionRate(completedModules, totalModules),
    totalHoursSpent:
      path?.modules
        .filter((module) => module.isCompleted)
        .reduce((hours, module) => hours + module.durationHours, 0) ?? 0,
    nextAction: 'Lanjutkan modul berikutnya agar progres tetap konsisten.',
    timeline: [],
    aiSuggestions: [],
  }
}

function updateProgressSummary(learningPathId: string) {
  const path = learningPathState.find((item) => item.id === learningPathId)

  if (!path) {
    return resolveProgressSummary(learningPathId)
  }

  const completedModules = path.modules.filter((module) => module.isCompleted).length
  const totalModules = path.modules.length
  const completionRate = calculateCompletionRate(completedModules, totalModules)
  const totalHoursSpent = path.modules
    .filter((module) => module.isCompleted)
    .reduce((hours, module) => hours + module.durationHours, 0)

  const nextModule = path.modules.find((module) => !module.isCompleted)
  const existingSummary = resolveProgressSummary(learningPathId)

  const refreshedSummary = {
    ...existingSummary,
    completedModules,
    totalModules,
    completionRate,
    totalHoursSpent,
    nextAction: nextModule
      ? `Prioritaskan modul ${nextModule.order}: ${nextModule.title}.`
      : 'Semua modul selesai. Saatnya validasi portfolio dan mulai apply kerja.',
  }

  const summaryIndex = progressSummaryState.findIndex((item) => item.learningPathId === learningPathId)

  if (summaryIndex >= 0) {
    progressSummaryState[summaryIndex] = refreshedSummary
  } else {
    progressSummaryState.push(refreshedSummary)
  }

  if (completionRate >= 60) {
    badgesState = badgesState.map((badge) => {
      if (badge.id !== 'badge-003') {
        return badge
      }

      return {
        ...badge,
        isUnlocked: true,
        unlockedAt: badge.unlockedAt ?? new Date().toISOString().slice(0, 10),
      }
    })
  }

  return refreshedSummary
}

function ensureAssessment(payload: RecommendationRequest): AssessmentDraft {
  const assessment = assessmentMap.get(payload.assessmentId)

  if (assessment) {
    return assessment
  }

  return cloneDeep(mockAssessmentAnswers)
}

export const mockCareerApiService: CareerApiService = {
  async getUserProfile(): Promise<GetUserProfileResponse> {
    return withDelay(createApiResponse(cloneDeep(mockUserProfile), 'User profile fetched.'))
  },

  async getCareerGoals(): Promise<GetCareerGoalsResponse> {
    return withDelay(createApiResponse(cloneDeep(mockCareerGoals), 'Career goals fetched.'))
  },

  async getMyAssessments(): Promise<GetMyAssessmentsResponse> {
    const sortedHistory = [...assessmentHistoryState].sort((first, second) =>
      second.submittedAt.localeCompare(first.submittedAt),
    )

    return withDelay(createApiResponse(cloneDeep(sortedHistory), 'Assessment history fetched.'))
  },

  async submitAssessment(payload: SubmitAssessmentRequest): Promise<SubmitAssessmentResponse> {
    const assessmentId = generateAssessmentId()
    const submittedAt = new Date().toISOString()

    assessmentMap.set(assessmentId, cloneDeep(payload.assessment))
    assessmentHistoryState.unshift(toAssessmentHistoryItem(assessmentId, payload.assessment, submittedAt))

    return withDelay(
      createApiResponse(
        {
          assessmentId,
          hasCareerGoal: Boolean(payload.assessment.careerGoalId),
          submittedAt,
        },
        'Assessment submitted successfully.',
      ),
      900,
    )
  },

  async getRecommendations(payload: RecommendationRequest): Promise<RecommendationResponse> {
    const assessment = ensureAssessment(payload)
    const selectedCareerGoalId = payload.selectedCareerGoalId ?? assessment.careerGoalId

    if (!selectedCareerGoalId) {
      return withDelay(
        createApiResponse(
          {
            mode: 'need-goal-selection',
            recommendations: cloneDeep(mockCareerRecommendations),
            skillGapSummary: cloneDeep(mockSkillGapByCareerGoal['cg-data-analyst']),
            reasoning:
              'Berdasarkan profil, pengalaman, dan preferensi kerja, AI menilai kamu cocok di beberapa role. Pilih role yang paling relevan agar learning path lebih personal.',
          },
          'Career recommendations generated.',
        ),
        850,
      )
    }

    const selectedCareerGoal = mockCareerGoals.find((goal) => goal.id === selectedCareerGoalId)

    if (!selectedCareerGoal) {
      throw new Error('Selected career goal not found.')
    }

    const selectedPath = learningPathState.find((path) => path.careerGoalId === selectedCareerGoalId)

    if (!selectedPath) {
      throw new Error('Learning path for selected career goal not found.')
    }

    return withDelay(
      createApiResponse(
        {
          mode: 'direct-path',
          selectedCareerGoal: cloneDeep(selectedCareerGoal),
          learningPathId: selectedPath.id,
          skillGapSummary:
            cloneDeep(mockSkillGapByCareerGoal[selectedCareerGoalId]) ??
            cloneDeep(mockSkillGapByCareerGoal['cg-data-analyst']),
          reasoning:
            'AI menyesuaikan rekomendasi berdasarkan skill saat ini, kecepatan belajar, dan tren permintaan industri terbaru.',
        },
        'Personalized learning path is ready.',
      ),
      950,
    )
  },

  async getLearningPathById(pathId: string): Promise<GetLearningPathResponse> {
    const path = learningPathState.find((item) => item.id === pathId)

    if (!path) {
      throw new Error('Learning path not found.')
    }

    return withDelay(createApiResponse(cloneDeep(path), 'Learning path fetched.'))
  },

  async updateLearningPathProgress(
    pathId: string,
    payload: UpdateLearningProgressRequest,
  ): Promise<UpdateLearningProgressResponse> {
    const pathIndex = learningPathState.findIndex((item) => item.id === pathId)

    if (pathIndex < 0) {
      throw new Error('Learning path not found.')
    }

    const moduleIndex = learningPathState[pathIndex].modules.findIndex(
      (module) => module.id === payload.moduleId,
    )

    if (moduleIndex < 0) {
      throw new Error('Learning module not found.')
    }

    learningPathState[pathIndex].modules[moduleIndex].isCompleted = payload.completed

    const summary = updateProgressSummary(pathId)

    return withDelay(
      createApiResponse(
        {
          learningPath: cloneDeep(learningPathState[pathIndex]),
          progressSummary: cloneDeep(summary),
        },
        'Learning progress updated.',
      ),
      500,
    )
  },

  async getBadges(): Promise<GetBadgesResponse> {
    return withDelay(createApiResponse(cloneDeep(badgesState), 'Badges fetched.'))
  },

  async getIndustryTrends(): Promise<GetIndustryTrendsResponse> {
    return withDelay(createApiResponse(cloneDeep(mockIndustryTrends), 'Industry trends fetched.'))
  },

  async getCompanyCandidates(): Promise<GetCompanyCandidatesResponse> {
    return withDelay(
      createApiResponse(cloneDeep(mockCompanyCandidates), 'Company candidate summaries fetched.'),
    )
  },

  async getJobRecommendations(): Promise<GetJobRecommendationsResponse> {
    return withDelay(
      createApiResponse(
        {
          insight: cloneDeep(mockJobSearchInsight),
          recommendations: cloneDeep(mockJobRecommendations),
        },
        'Job recommendations fetched.',
      ),
    )
  },

  async getCompanyJobs(): Promise<GetCompanyJobPostsResponse> {
    return withDelay(createApiResponse(cloneDeep(companyJobsState), 'Company jobs fetched.'))
  },

  async createCompanyJob(payload: CreateCompanyJobPostRequest): Promise<CreateCompanyJobPostResponse> {
    const createdJob = {
      id: `cjob-${Math.random().toString(36).slice(2, 10)}`,
      ...cloneDeep(payload),
      status: 'open' as const,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
    }

    companyJobsState = [createdJob, ...companyJobsState]

    return withDelay(createApiResponse(cloneDeep(createdJob), 'Company job created.'), 500)
  },

  async getProgressSummary(learningPathId: string): Promise<GetProgressSummaryResponse> {
    const summary = resolveProgressSummary(learningPathId)

    return withDelay(createApiResponse(cloneDeep(summary), 'Progress summary fetched.'))
  },
}
