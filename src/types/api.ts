import type {
  AssessmentDraft,
  AssessmentHistoryItem,
  Badge,
  CareerGoal,
  CareerRecommendation,
  CompanyJobPost,
  CompanyCandidateSummary,
  IndustryTrend,
  JobRecommendation,
  JobSearchInsight,
  LearningPath,
  ProgressSummary,
  SkillCatalogItem,
  SkillGapSummary,
  UserRole,
  UserProfile,
} from './entities'

export interface ApiMeta {
  requestId: string
  timestamp: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  meta: ApiMeta
}

export interface SubmitAssessmentRequest {
  assessment: AssessmentDraft
}

export interface SubmitAssessmentResponseData {
  assessmentId: string
  hasCareerGoal: boolean
  submittedAt: string
}

export interface RecommendationRequest {
  assessmentId: string
  selectedCareerGoalId?: string
}

export interface GetSkillsRequest {
  search?: string
  page?: number
  length?: number
}

export interface CreateSkillRequest {
  name: string
}

export interface PaginationData {
  page: number
  length: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedListData<T> {
  items: T[]
  pagination: PaginationData
}

export interface RecommendationNeedsGoalData {
  mode: 'need-goal-selection'
  recommendations: CareerRecommendation[]
  skillGapSummary: SkillGapSummary
  reasoning: string
}

export interface RecommendationDirectPathData {
  mode: 'direct-path'
  selectedCareerGoal: CareerGoal
  learningPathId: string
  skillGapSummary: SkillGapSummary
  reasoning: string
}

export type RecommendationResponseData =
  | RecommendationNeedsGoalData
  | RecommendationDirectPathData

export interface UpdateLearningProgressRequest {
  moduleId: string
  completed: boolean
}

export interface UpdateLearningProgressResponseData {
  learningPath: LearningPath
  progressSummary: ProgressSummary
}

export interface CreateCompanyJobPostRequest {
  title: string
  location: string
  workMode: 'remote' | 'hybrid' | 'onsite'
  jobType: 'full-time' | 'contract' | 'freelance'
  salaryRange: string
  requiredSkills: string[]
  description: string
}

export interface JobRecommendationsResponseData {
  insight: JobSearchInsight
  recommendations: JobRecommendation[]
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken?: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface RegisterRequest {
  fullName: string
  username: string
  email: string
  password: string
}

export interface RegisterResponseData {
  userId: string
  username: string
  email: string
  displayName: string
  createdAt: string
}

export interface ForgotPasswordRequest {
  identifier: string
}

export interface ForgotPasswordResponseData {
  deliveryChannel: 'email'
  maskedDestination: string
  expiresInMinutes: number
}

export interface LoginResponseData {
  userId: string
  displayName: string
  email: string
  accessToken: string
  refreshToken?: string
  authProvider: 'password' | 'google'
  role?: UserRole
}

export interface RefreshTokenResponseData {
  accessToken: string
  refreshToken?: string
}

export interface LogoutResponseData {
  success: boolean
}

export type GetUserProfileResponse = ApiResponse<UserProfile>
export type GetCareerGoalsResponse = ApiResponse<CareerGoal[]>
export type GetMyAssessmentsResponse = ApiResponse<AssessmentHistoryItem[]>
export type SubmitAssessmentResponse = ApiResponse<SubmitAssessmentResponseData>
export type RecommendationResponse = ApiResponse<RecommendationResponseData>
export type GetLearningPathResponse = ApiResponse<LearningPath>
export type UpdateLearningProgressResponse = ApiResponse<UpdateLearningProgressResponseData>
export type GetBadgesResponse = ApiResponse<Badge[]>
export type GetIndustryTrendsResponse = ApiResponse<IndustryTrend[]>
export type GetCompanyCandidatesResponse = ApiResponse<CompanyCandidateSummary[]>
export type GetProgressSummaryResponse = ApiResponse<ProgressSummary>
export type GetJobRecommendationsResponse = ApiResponse<JobRecommendationsResponseData>
export type GetCompanyJobPostsResponse = ApiResponse<CompanyJobPost[]>
export type CreateCompanyJobPostResponse = ApiResponse<CompanyJobPost>
export type GetSkillsResponse = ApiResponse<PaginatedListData<SkillCatalogItem>>
export type CreateSkillResponse = ApiResponse<SkillCatalogItem>
export type LoginResponse = ApiResponse<LoginResponseData>
export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>
export type LogoutResponse = ApiResponse<LogoutResponseData>
export type RegisterResponse = ApiResponse<RegisterResponseData>
export type ForgotPasswordResponse = ApiResponse<ForgotPasswordResponseData>
