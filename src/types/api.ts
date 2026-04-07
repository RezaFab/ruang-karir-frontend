import type {
  AssessmentDraft,
  Badge,
  CareerGoal,
  CareerRecommendation,
  CompanyCandidateSummary,
  IndustryTrend,
  LearningPath,
  ProgressSummary,
  SkillGapSummary,
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

export interface LoginRequest {
  identifier: string
  password: string
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
  authProvider: 'password' | 'google'
}

export type GetUserProfileResponse = ApiResponse<UserProfile>
export type GetCareerGoalsResponse = ApiResponse<CareerGoal[]>
export type SubmitAssessmentResponse = ApiResponse<SubmitAssessmentResponseData>
export type RecommendationResponse = ApiResponse<RecommendationResponseData>
export type GetLearningPathResponse = ApiResponse<LearningPath>
export type UpdateLearningProgressResponse = ApiResponse<UpdateLearningProgressResponseData>
export type GetBadgesResponse = ApiResponse<Badge[]>
export type GetIndustryTrendsResponse = ApiResponse<IndustryTrend[]>
export type GetCompanyCandidatesResponse = ApiResponse<CompanyCandidateSummary[]>
export type GetProgressSummaryResponse = ApiResponse<ProgressSummary>
export type LoginResponse = ApiResponse<LoginResponseData>
export type RegisterResponse = ApiResponse<RegisterResponseData>
export type ForgotPasswordResponse = ApiResponse<ForgotPasswordResponseData>
