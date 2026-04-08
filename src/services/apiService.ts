import type {
  CreateCompanyJobPostRequest,
  CreateCompanyJobPostResponse,
  CreateSkillRequest,
  CreateSkillResponse,
  DeleteCompanyJobPostResponse,
  GetAssessmentsMeRequest,
  GetBadgesRequest,
  GetCompanyCandidatesRequest,
  GetCompanyJobByIdResponse,
  GetCompanyJobsRequest,
  GetLearningPathModulesRequest,
  GetLearningPathModulesResponse,
  GetJobRecommendationsRequest,
  GetSkillsRequest,
  GetBadgesResponse,
  GetCareerGoalsResponse,
  GetCompanyJobPostsResponse,
  GetCompanyCandidatesResponse,
  GetIndustryTrendsResponse,
  GetJobRecommendationsResponse,
  GetLearningPathResponse,
  GetMyAssessmentsResponse,
  GetProgressSummaryResponse,
  GetSkillsResponse,
  GetUserProfileResponse,
  RecommendationRequest,
  RecommendationResponse,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  UpdateCompanyJobPostRequest,
  UpdateCompanyJobPostResponse,
  UpdateLearningProgressRequest,
  UpdateLearningProgressResponse,
} from '../types'

export interface CareerApiService {
  getUserProfile(): Promise<GetUserProfileResponse>
  getCareerGoals(): Promise<GetCareerGoalsResponse>
  getMyAssessments(params?: GetAssessmentsMeRequest): Promise<GetMyAssessmentsResponse>
  submitAssessment(payload: SubmitAssessmentRequest): Promise<SubmitAssessmentResponse>
  getRecommendations(payload: RecommendationRequest): Promise<RecommendationResponse>
  getLearningPathById(pathId: string): Promise<GetLearningPathResponse>
  getLearningPathModules(
    pathId: string,
    params?: GetLearningPathModulesRequest,
  ): Promise<GetLearningPathModulesResponse>
  updateLearningPathProgress(
    pathId: string,
    payload: UpdateLearningProgressRequest,
  ): Promise<UpdateLearningProgressResponse>
  getBadges(params?: GetBadgesRequest): Promise<GetBadgesResponse>
  getIndustryTrends(): Promise<GetIndustryTrendsResponse>
  getCompanyCandidates(params?: GetCompanyCandidatesRequest): Promise<GetCompanyCandidatesResponse>
  getJobRecommendations(params?: GetJobRecommendationsRequest): Promise<GetJobRecommendationsResponse>
  getCompanyJobs(params?: GetCompanyJobsRequest): Promise<GetCompanyJobPostsResponse>
  getCompanyJobById(jobId: string): Promise<GetCompanyJobByIdResponse>
  createCompanyJob(payload: CreateCompanyJobPostRequest): Promise<CreateCompanyJobPostResponse>
  updateCompanyJob(
    jobId: string,
    payload: UpdateCompanyJobPostRequest,
  ): Promise<UpdateCompanyJobPostResponse>
  deleteCompanyJob(jobId: string): Promise<DeleteCompanyJobPostResponse>
  getSkills(params?: GetSkillsRequest): Promise<GetSkillsResponse>
  createSkill(payload: CreateSkillRequest): Promise<CreateSkillResponse>
  getProgressSummary(learningPathId: string): Promise<GetProgressSummaryResponse>
}
