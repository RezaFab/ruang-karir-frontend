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
