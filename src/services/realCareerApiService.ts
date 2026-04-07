import type { CareerApiService } from './apiService'
import { endpoints } from './contracts'
import { requestJson } from './httpClient'
import type {
  GetBadgesResponse,
  GetCareerGoalsResponse,
  GetCompanyCandidatesResponse,
  GetIndustryTrendsResponse,
  GetLearningPathResponse,
  GetProgressSummaryResponse,
  GetUserProfileResponse,
  RecommendationRequest,
  RecommendationResponse,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  UpdateLearningProgressRequest,
  UpdateLearningProgressResponse,
} from '../types'

export const realCareerApiService: CareerApiService = {
  getUserProfile() {
    return requestJson<GetUserProfileResponse['data']>(endpoints.userProfile)
  },

  getCareerGoals() {
    return requestJson<GetCareerGoalsResponse['data']>(endpoints.careerGoals)
  },

  submitAssessment(payload: SubmitAssessmentRequest) {
    return requestJson<SubmitAssessmentResponse['data']>(endpoints.assessments, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getRecommendations(payload: RecommendationRequest) {
    return requestJson<RecommendationResponse['data']>(endpoints.recommendations, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getLearningPathById(pathId: string) {
    return requestJson<GetLearningPathResponse['data']>(endpoints.learningPathById(pathId))
  },

  updateLearningPathProgress(pathId: string, payload: UpdateLearningProgressRequest) {
    return requestJson<UpdateLearningProgressResponse['data']>(endpoints.learningPathProgress(pathId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  getBadges() {
    return requestJson<GetBadgesResponse['data']>(endpoints.badges)
  },

  getIndustryTrends() {
    return requestJson<GetIndustryTrendsResponse['data']>(endpoints.industryTrends)
  },

  getCompanyCandidates() {
    return requestJson<GetCompanyCandidatesResponse['data']>(endpoints.companyCandidates)
  },

  getProgressSummary(learningPathId: string) {
    return requestJson<GetProgressSummaryResponse['data']>(
      endpoints.progressSummaryByPath(learningPathId),
    )
  },
}
