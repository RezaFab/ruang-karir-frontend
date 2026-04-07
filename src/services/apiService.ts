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

export interface CareerApiService {
  getUserProfile(): Promise<GetUserProfileResponse>
  getCareerGoals(): Promise<GetCareerGoalsResponse>
  submitAssessment(payload: SubmitAssessmentRequest): Promise<SubmitAssessmentResponse>
  getRecommendations(payload: RecommendationRequest): Promise<RecommendationResponse>
  getLearningPathById(pathId: string): Promise<GetLearningPathResponse>
  updateLearningPathProgress(
    pathId: string,
    payload: UpdateLearningProgressRequest,
  ): Promise<UpdateLearningProgressResponse>
  getBadges(): Promise<GetBadgesResponse>
  getIndustryTrends(): Promise<GetIndustryTrendsResponse>
  getCompanyCandidates(): Promise<GetCompanyCandidatesResponse>
  getProgressSummary(learningPathId: string): Promise<GetProgressSummaryResponse>
}
