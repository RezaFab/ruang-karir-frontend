import type { CareerApiService } from './apiService'
import { endpoints } from './contracts'
import { requestJson } from './httpClient'
import {
  buildListQueryString,
  normalizeListQueryParams,
  normalizePaginatedListData,
} from './pagination'
import { useSessionStore } from '../store'
import type {
  AssessmentHistoryItem,
  CreateCompanyJobPostRequest,
  CreateCompanyJobPostResponse,
  CreateSkillRequest,
  CreateSkillResponse,
  GetBadgesResponse,
  GetCareerGoalsResponse,
  GetCompanyJobPostsResponse,
  GetCompanyCandidatesResponse,
  GetIndustryTrendsResponse,
  GetJobRecommendationsResponse,
  GetLearningPathResponse,
  GetMyAssessmentsResponse,
  GetProgressSummaryResponse,
  GetSkillsRequest,
  GetSkillsResponse,
  GetUserProfileResponse,
  RecommendationRequest,
  RecommendationResponse,
  SkillCatalogItem,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  UpdateLearningProgressRequest,
  UpdateLearningProgressResponse,
} from '../types'

type GenericRecord = Record<string, unknown>

function buildAuthHeaders(): HeadersInit | undefined {
  const accessToken = useSessionStore.getState().accessToken

  if (!accessToken) {
    return undefined
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

function asRecord(value: unknown): GenericRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as GenericRecord
}

function readString(record: GenericRecord | null, key: string): string | undefined {
  if (!record) {
    return undefined
  }

  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

function readStringArray(record: GenericRecord | null, key: string): string[] {
  if (!record) {
    return []
  }

  const value = record[key]
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function toWorkMode(value: string | undefined): AssessmentHistoryItem['workMode'] {
  if (value === 'remote' || value === 'hybrid' || value === 'onsite') {
    return value
  }

  return undefined
}

function toJobType(value: string | undefined): AssessmentHistoryItem['jobType'] {
  if (value === 'full-time' || value === 'contract' || value === 'freelance') {
    return value
  }

  return undefined
}

function parseWorkPreference(value: string | undefined): {
  workMode?: AssessmentHistoryItem['workMode']
  jobType?: AssessmentHistoryItem['jobType']
} {
  if (!value || !value.includes(':')) {
    return {}
  }

  const [workMode, jobType] = value.split(':')
  return {
    workMode: toWorkMode(workMode),
    jobType: toJobType(jobType),
  }
}

function normalizeAssessmentHistoryItem(value: unknown): AssessmentHistoryItem | null {
  const record = asRecord(value)
  if (!record) {
    return null
  }

  const assessmentPayload = asRecord(record.assessmentPayload)
  const basicProfile = asRecord(assessmentPayload?.basicProfile)
  const workPreferences = asRecord(assessmentPayload?.workPreferences)
  const learningPreferences = asRecord(assessmentPayload?.learningPreferences)
  const parsedWorkPreference = parseWorkPreference(readString(record, 'workPreference'))

  const assessmentId = readString(record, 'assessmentId') ?? readString(record, 'id')
  if (!assessmentId) {
    return null
  }

  const submittedAt =
    readString(record, 'submittedAt') ??
    readString(record, 'createdAt') ??
    new Date().toISOString()

  const careerGoalId =
    readString(record, 'careerGoalId') ??
    readString(record, 'targetCareer') ??
    readString(assessmentPayload, 'careerGoalId')

  const hasCareerGoalRaw = record.hasCareerGoal
  const hasCareerGoal =
    typeof hasCareerGoalRaw === 'boolean' ? hasCareerGoalRaw : Boolean(careerGoalId)

  const preferredIndustriesDirect = readStringArray(record, 'preferredIndustries')
  const preferredIndustriesLegacy = readStringArray(record, 'interests')
  const preferredIndustriesFromPayload = readStringArray(workPreferences, 'preferredIndustries')

  const existingSkillsDirect = readStringArray(record, 'existingSkills')
  const existingSkillsLegacy = readStringArray(record, 'skills')
  const existingSkillsFromPayload = readStringArray(assessmentPayload, 'existingSkills')

  return {
    assessmentId,
    submittedAt,
    hasCareerGoal,
    careerGoalId,
    currentRole: readString(record, 'currentRole') ?? readString(basicProfile, 'currentRole'),
    learningPace:
      readString(record, 'learningPace') ?? readString(learningPreferences, 'pace'),
    workMode:
      toWorkMode(readString(record, 'workMode')) ??
      toWorkMode(readString(workPreferences, 'workMode')) ??
      parsedWorkPreference.workMode,
    jobType:
      toJobType(readString(record, 'jobType')) ??
      toJobType(readString(workPreferences, 'jobType')) ??
      parsedWorkPreference.jobType,
    preferredIndustries:
      preferredIndustriesDirect.length > 0
        ? preferredIndustriesDirect
        : preferredIndustriesLegacy.length > 0
          ? preferredIndustriesLegacy
          : preferredIndustriesFromPayload,
    existingSkills:
      existingSkillsDirect.length > 0
        ? existingSkillsDirect
        : existingSkillsLegacy.length > 0
          ? existingSkillsLegacy
          : existingSkillsFromPayload,
  }
}

export const careerApiService: CareerApiService = {
  getUserProfile(): Promise<GetUserProfileResponse> {
    return requestJson<GetUserProfileResponse['data']>(endpoints.userProfile, {
      headers: buildAuthHeaders(),
    })
  },

  getCareerGoals(): Promise<GetCareerGoalsResponse> {
    return requestJson<GetCareerGoalsResponse['data']>(endpoints.careerGoals)
  },

  async getMyAssessments(): Promise<GetMyAssessmentsResponse> {
    const response = await requestJson<unknown[]>(endpoints.assessmentsMe, {
      headers: buildAuthHeaders(),
    })

    const normalizedData = Array.isArray(response.data)
      ? response.data
          .map((item) => normalizeAssessmentHistoryItem(item))
          .filter((item): item is AssessmentHistoryItem => Boolean(item))
          .sort((first, second) => second.submittedAt.localeCompare(first.submittedAt))
      : []

    return {
      ...response,
      data: normalizedData,
    }
  },

  submitAssessment(payload: SubmitAssessmentRequest): Promise<SubmitAssessmentResponse> {
    return requestJson<SubmitAssessmentResponse['data']>(endpoints.assessments, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
  },

  getRecommendations(payload: RecommendationRequest): Promise<RecommendationResponse> {
    return requestJson<RecommendationResponse['data']>(endpoints.recommendations, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
  },

  getLearningPathById(pathId: string): Promise<GetLearningPathResponse> {
    return requestJson<GetLearningPathResponse['data']>(endpoints.learningPathById(pathId), {
      headers: buildAuthHeaders(),
    })
  },

  updateLearningPathProgress(
    pathId: string,
    payload: UpdateLearningProgressRequest,
  ): Promise<UpdateLearningProgressResponse> {
    return requestJson<UpdateLearningProgressResponse['data']>(endpoints.learningPathProgress(pathId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
  },

  getBadges(): Promise<GetBadgesResponse> {
    return requestJson<GetBadgesResponse['data']>(endpoints.badges, {
      headers: buildAuthHeaders(),
    })
  },

  getIndustryTrends(): Promise<GetIndustryTrendsResponse> {
    return requestJson<GetIndustryTrendsResponse['data']>(endpoints.industryTrends, {
      headers: buildAuthHeaders(),
    })
  },

  getCompanyCandidates(): Promise<GetCompanyCandidatesResponse> {
    return requestJson<GetCompanyCandidatesResponse['data']>(endpoints.companyCandidates, {
      headers: buildAuthHeaders(),
    })
  },

  getJobRecommendations(): Promise<GetJobRecommendationsResponse> {
    return requestJson<GetJobRecommendationsResponse['data']>(endpoints.jobRecommendations, {
      headers: buildAuthHeaders(),
    })
  },

  getCompanyJobs(): Promise<GetCompanyJobPostsResponse> {
    return requestJson<GetCompanyJobPostsResponse['data']>(endpoints.companyJobs, {
      headers: buildAuthHeaders(),
    })
  },

  createCompanyJob(payload: CreateCompanyJobPostRequest): Promise<CreateCompanyJobPostResponse> {
    return requestJson<CreateCompanyJobPostResponse['data']>(endpoints.companyJobs, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
  },

  async getSkills(params?: GetSkillsRequest): Promise<GetSkillsResponse> {
    const normalizedParams = normalizeListQueryParams(params)
    const queryString = buildListQueryString(normalizedParams)
    const endpoint = `${endpoints.skills}?${queryString}`
    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    return {
      ...response,
      data: normalizePaginatedListData<SkillCatalogItem>(response.data, normalizedParams),
    }
  },

  createSkill(payload: CreateSkillRequest): Promise<CreateSkillResponse> {
    return requestJson<CreateSkillResponse['data']>(endpoints.skills, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
  },

  getProgressSummary(learningPathId: string): Promise<GetProgressSummaryResponse> {
    return requestJson<GetProgressSummaryResponse['data']>(endpoints.progressSummaryByPath(learningPathId), {
      headers: buildAuthHeaders(),
    })
  },
}
