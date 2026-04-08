import type {
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

export interface CareerApiService {
  getUserProfile(): Promise<GetUserProfileResponse>
  getCareerGoals(): Promise<GetCareerGoalsResponse>
  getMyAssessments(): Promise<GetMyAssessmentsResponse>
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
  getJobRecommendations(): Promise<GetJobRecommendationsResponse>
  getCompanyJobs(): Promise<GetCompanyJobPostsResponse>
  createCompanyJob(payload: CreateCompanyJobPostRequest): Promise<CreateCompanyJobPostResponse>
  getProgressSummary(learningPathId: string): Promise<GetProgressSummaryResponse>
}
