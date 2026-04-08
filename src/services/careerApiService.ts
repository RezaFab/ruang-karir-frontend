import type { CareerApiService } from './apiService'
import { endpoints } from './contracts'
import { requestJson } from './httpClient'
import {
  buildListQueryString,
  isPaginationRequested,
  normalizeLegacyOrPaginatedListData,
  normalizeListQueryParams,
  normalizePaginatedListData,
} from './pagination'
import { useSessionStore } from '../store'
import type {
  AssessmentHistoryItem,
  Badge,
  CompanyJobPost,
  CompanyCandidateSummary,
  CreateCompanyJobPostRequest,
  CreateCompanyJobPostResponse,
  CreateSkillRequest,
  CreateSkillResponse,
  DeleteCompanyJobPostResponse,
  GetAssessmentsMeRequest,
  GetBadgesRequest,
  GetBadgesResponse,
  GetCareerGoalsResponse,
  GetCompanyCandidatesRequest,
  GetCompanyCandidatesResponse,
  GetCompanyJobByIdResponse,
  GetCompanyJobsRequest,
  GetCompanyJobPostsResponse,
  GetIndustryTrendsResponse,
  GetJobRecommendationsRequest,
  GetJobRecommendationsResponse,
  GetLearningPathModulesRequest,
  GetLearningPathModulesResponse,
  GetLearningPathResponse,
  GetMyAssessmentsResponse,
  GetProgressSummaryResponse,
  GetSkillsRequest,
  GetSkillsResponse,
  GetUserProfileResponse,
  JobRecommendationsResponseData,
  JobSearchInsight,
  ListQueryParams,
  RecommendationRequest,
  RecommendationResponse,
  SkillCatalogItem,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  UpdateCompanyJobPostRequest,
  UpdateCompanyJobPostResponse,
  UpdateLearningProgressRequest,
  UpdateLearningProgressResponse,
} from '../types'

type GenericRecord = Record<string, unknown>
type ListParamValue = string | number | boolean | null | undefined

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

function readNumber(record: GenericRecord | null, key: string, fallback = 0): number {
  if (!record) {
    return fallback
  }

  const value = record[key]
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function readBoolean(record: GenericRecord | null, key: string, fallback = false): boolean {
  if (!record) {
    return fallback
  }

  const value = record[key]
  return typeof value === 'boolean' ? value : fallback
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

function buildLegacyQueryString(extraParams: Record<string, ListParamValue>): string {
  const searchParams = new URLSearchParams()

  Object.entries(extraParams).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return
    }

    if (typeof rawValue === 'string') {
      const normalized = rawValue.trim()
      if (!normalized || normalized.toLowerCase() === 'all') {
        return
      }
      searchParams.set(key, normalized)
      return
    }

    searchParams.set(key, String(rawValue))
  })

  return searchParams.toString()
}

function buildListEndpoint(
  basePath: string,
  params: ListQueryParams | undefined,
  extraParams: Record<string, ListParamValue> = {},
): { endpoint: string; normalizedParams: Required<ListQueryParams> } {
  const normalizedParams = normalizeListQueryParams(params)
  const hasPagination = isPaginationRequested(params)

  if (hasPagination) {
    return {
      endpoint: `${basePath}?${buildListQueryString(normalizedParams, extraParams)}`,
      normalizedParams,
    }
  }

  const legacyQuery = buildLegacyQueryString({
    search: normalizedParams.search || undefined,
    ...extraParams,
  })

  return {
    endpoint: legacyQuery ? `${basePath}?${legacyQuery}` : basePath,
    normalizedParams,
  }
}

function normalizeJobInsight(rawInsight: unknown): JobSearchInsight {
  const insightRecord = asRecord(rawInsight)

  const readinessRaw = readString(insightRecord, 'readinessLabel')
  const readinessLabel: JobSearchInsight['readinessLabel'] =
    readinessRaw === 'Sangat Sesuai' || readinessRaw === 'Cukup Sesuai' || readinessRaw === 'Perlu Penguatan'
      ? readinessRaw
      : 'Perlu Penguatan'

  return {
    overallProfileMatchScore: readNumber(insightRecord, 'overallProfileMatchScore', 0),
    readinessLabel,
    note: readString(insightRecord, 'note') ?? '',
  }
}

function normalizeJobRecommendationsData(
  rawData: unknown,
  fallbackParams: Required<ListQueryParams>,
): JobRecommendationsResponseData {
  const dataRecord = asRecord(rawData)
  const legacyRecommendations = dataRecord?.recommendations
  const paginatedRecommendations = normalizeLegacyOrPaginatedListData(
    rawData,
    fallbackParams,
  )

  const recommendations = Array.isArray(legacyRecommendations)
    ? (legacyRecommendations as JobRecommendationsResponseData['recommendations'])
    : (paginatedRecommendations.items as JobRecommendationsResponseData['recommendations'])

  return {
    insight: normalizeJobInsight(dataRecord?.insight),
    recommendations,
  }
}

function normalizeCompanyJob(rawData: unknown): CompanyJobPost | null {
  const data = asRecord(rawData)
  const id = readString(data, 'id')
  const title = readString(data, 'title')

  if (!id || !title) {
    return null
  }

  const workModeRaw = readString(data, 'workMode')
  const jobTypeRaw = readString(data, 'jobType')
  const statusRaw = readString(data, 'status')

  return {
    id,
    title,
    location: readString(data, 'location') ?? '',
    workMode:
      workModeRaw === 'remote' || workModeRaw === 'hybrid' || workModeRaw === 'onsite'
        ? workModeRaw
        : 'hybrid',
    jobType:
      jobTypeRaw === 'full-time' || jobTypeRaw === 'contract' || jobTypeRaw === 'freelance'
        ? jobTypeRaw
        : 'full-time',
    salaryRange: readString(data, 'salaryRange') ?? '',
    requiredSkills: readStringArray(data, 'requiredSkills'),
    description: readString(data, 'description') ?? '',
    status:
      statusRaw === 'open' || statusRaw === 'draft' || statusRaw === 'closed'
        ? statusRaw
        : 'draft',
    applicantsCount: readNumber(data, 'applicantsCount', 0),
    createdAt: readString(data, 'createdAt') ?? new Date().toISOString(),
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

  async getMyAssessments(params?: GetAssessmentsMeRequest): Promise<GetMyAssessmentsResponse> {
    const { endpoint, normalizedParams } = buildListEndpoint(endpoints.assessmentsMe, params, {
      hasCareerGoal: params?.hasCareerGoal,
      workMode: params?.workMode,
      jobType: params?.jobType,
    })

    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    const normalizedData = normalizeLegacyOrPaginatedListData<AssessmentHistoryItem>(
      response.data,
      normalizedParams,
      normalizeAssessmentHistoryItem,
    ).items.sort((first, second) => second.submittedAt.localeCompare(first.submittedAt))

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

  async getLearningPathModules(
    pathId: string,
    params?: GetLearningPathModulesRequest,
  ): Promise<GetLearningPathModulesResponse> {
    const normalizedParams = normalizeListQueryParams(params)
    const queryString = buildListQueryString(normalizedParams, {
      status: params?.status,
      sort: params?.sort,
      order: params?.order,
    })
    const endpoint = `${endpoints.learningPathModulesById(pathId)}?${queryString}`

    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    return {
      ...response,
      data: normalizePaginatedListData(response.data, normalizedParams),
    }
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

  async getBadges(params?: GetBadgesRequest): Promise<GetBadgesResponse> {
    const { endpoint, normalizedParams } = buildListEndpoint(endpoints.badges, params, {
      status: params?.status,
    })

    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    const normalizedData = normalizeLegacyOrPaginatedListData<Badge>(
      response.data,
      normalizedParams,
    ).items

    return {
      ...response,
      data: normalizedData,
    }
  },

  getIndustryTrends(): Promise<GetIndustryTrendsResponse> {
    return requestJson<GetIndustryTrendsResponse['data']>(endpoints.industryTrends, {
      headers: buildAuthHeaders(),
    })
  },

  async getCompanyCandidates(
    params?: GetCompanyCandidatesRequest,
  ): Promise<GetCompanyCandidatesResponse> {
    const { endpoint, normalizedParams } = buildListEndpoint(endpoints.companyCandidates, params, {
      status: params?.status,
      sort: params?.sort,
      order: params?.order,
    })

    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    const normalizedData = normalizeLegacyOrPaginatedListData<CompanyCandidateSummary>(
      response.data,
      normalizedParams,
    ).items

    return {
      ...response,
      data: normalizedData,
    }
  },

  async getJobRecommendations(
    params?: GetJobRecommendationsRequest,
  ): Promise<GetJobRecommendationsResponse> {
    const { endpoint, normalizedParams } = buildListEndpoint(endpoints.jobRecommendations, params, {
      workMode: params?.workMode,
      jobType: params?.jobType,
      minMatchScore: params?.minMatchScore,
    })

    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    return {
      ...response,
      data: normalizeJobRecommendationsData(response.data, normalizedParams),
    }
  },

  async getCompanyJobs(params?: GetCompanyJobsRequest): Promise<GetCompanyJobPostsResponse> {
    const { endpoint, normalizedParams } = buildListEndpoint(endpoints.companyJobs, params, {
      status: params?.status,
      workMode: params?.workMode,
      jobType: params?.jobType,
    })

    const response = await requestJson<unknown>(endpoint, {
      headers: buildAuthHeaders(),
    })

    const normalizedData = normalizeLegacyOrPaginatedListData<CompanyJobPost>(
      response.data,
      normalizedParams,
      normalizeCompanyJob,
    ).items

    return {
      ...response,
      data: normalizedData,
    }
  },

  async getCompanyJobById(jobId: string): Promise<GetCompanyJobByIdResponse> {
    const response = await requestJson<unknown>(endpoints.companyJobById(jobId), {
      headers: buildAuthHeaders(),
    })
    const normalizedJob = normalizeCompanyJob(response.data)

    if (!normalizedJob) {
      throw new Error('Detail lowongan tidak valid.')
    }

    return {
      ...response,
      data: normalizedJob,
    }
  },

  async createCompanyJob(payload: CreateCompanyJobPostRequest): Promise<CreateCompanyJobPostResponse> {
    const response = await requestJson<unknown>(endpoints.companyJobs, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
    const normalizedJob = normalizeCompanyJob(response.data)

    if (!normalizedJob) {
      throw new Error('Data lowongan yang dibuat tidak valid.')
    }

    return {
      ...response,
      data: normalizedJob,
    }
  },

  async updateCompanyJob(
    jobId: string,
    payload: UpdateCompanyJobPostRequest,
  ): Promise<UpdateCompanyJobPostResponse> {
    const response = await requestJson<unknown>(endpoints.companyJobById(jobId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: buildAuthHeaders(),
    })
    const normalizedJob = normalizeCompanyJob(response.data)

    if (!normalizedJob) {
      throw new Error('Data lowongan yang diperbarui tidak valid.')
    }

    return {
      ...response,
      data: normalizedJob,
    }
  },

  async deleteCompanyJob(jobId: string): Promise<DeleteCompanyJobPostResponse> {
    const response = await requestJson<unknown>(endpoints.companyJobById(jobId), {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    })
    const record = asRecord(response.data)

    return {
      ...response,
      data: {
        success: readBoolean(record, 'success', true),
        id: readString(record, 'id') ?? jobId,
      },
    }
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
