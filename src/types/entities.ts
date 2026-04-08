export type UserRole = 'admin' | 'worker' | 'company'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  currentRole: string
  educationLevel: string
  yearsOfExperience: number
  city: string
}

export interface BasicProfileInput {
  fullName: string
  email: string
  currentRole: string
  educationLevel: string
  city: string
}

export interface WorkPreferenceInput {
  workMode: 'remote' | 'hybrid' | 'onsite'
  jobType: 'full-time' | 'contract' | 'freelance'
  preferredIndustries: string[]
}

export interface ExperienceInput {
  years: number
  highlights: string
}

export interface LearningPreferenceInput {
  pace: 'intensive' | 'balanced' | 'light'
  weeklyHours: number
  style: 'video' | 'project' | 'mixed'
}

export interface AssessmentDraft {
  basicProfile: BasicProfileInput
  workPreferences: WorkPreferenceInput
  existingSkills: string[]
  experience: ExperienceInput
  careerGoalId?: string
  learningPreferences: LearningPreferenceInput
}

export interface AssessmentHistoryItem {
  assessmentId: string
  submittedAt: string
  hasCareerGoal: boolean
  careerGoalId?: string
  currentRole?: string
  learningPace?: string
  workMode?: WorkPreferenceInput['workMode']
  jobType?: WorkPreferenceInput['jobType']
  preferredIndustries: string[]
  existingSkills: string[]
}

export interface CareerGoal {
  id: string
  title: string
  domain: string
  description: string
  demandScore: number
  averageSalary: string
  minimumTransitionMonths: number
}

export interface SkillCatalogItem {
  id: string
  name: string
  normalizedName: string
  usageCount: number
  source: 'system' | 'user'
  createdAt: string
}

export interface CareerRecommendation {
  careerGoalId: string
  title: string
  matchScore: number
  estimatedTransitionMonths: number
  reasons: string[]
  keySkillsToBuild: string[]
}

export interface IndustryTrend {
  id: string
  sector: string
  growthRate: string
  demandLevel: 'Very High' | 'High' | 'Medium'
  insight: string
}

export type LearningProvider = 'Dicoding' | 'Udemy' | 'Coursera'

export interface LearningModule {
  id: string
  order: number
  title: string
  provider: LearningProvider
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  durationHours: number
  description: string
  skills: string[]
  isCompleted: boolean
}

export interface LearningPath {
  id: string
  careerGoalId: string
  title: string
  summary: string
  estimatedWeeks: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  totalHours: number
  modules: LearningModule[]
}

export interface SkillGapSummary {
  strengths: string[]
  missingSkills: string[]
  urgency: 'Low' | 'Medium' | 'High'
  note: string
}

export interface TimelineEntry {
  id: string
  date: string
  title: string
  description: string
  status: 'done' | 'upcoming'
}

export interface AiSuggestion {
  id: string
  title: string
  description: string
  actionLabel: string
}

export interface ProgressSummary {
  learningPathId: string
  completedModules: number
  totalModules: number
  completionRate: number
  totalHoursSpent: number
  nextAction: string
  timeline: TimelineEntry[]
  aiSuggestions: AiSuggestion[]
}

export interface Badge {
  id: string
  name: string
  description: string
  requirement: string
  iconUrl: string
  isUnlocked: boolean
  unlockedAt?: string
}

export interface CompanyCandidateSummary {
  id: string
  fullName: string
  targetRole: string
  topSkills: string[]
  readinessScore: number
  status: 'Ready' | 'Needs Upskilling'
  summary: string
}

export interface JobRecommendation {
  id: string
  title: string
  companyName: string
  location: string
  workMode: WorkPreferenceInput['workMode']
  jobType: WorkPreferenceInput['jobType']
  salaryRange: string
  requiredSkills: string[]
  profileMatchScore: number
  postedAt: string
  summary: string
}

export interface JobSearchInsight {
  overallProfileMatchScore: number
  readinessLabel: 'Sangat Sesuai' | 'Cukup Sesuai' | 'Perlu Penguatan'
  note: string
}

export interface CompanyJobPost {
  id: string
  title: string
  location: string
  workMode: WorkPreferenceInput['workMode']
  jobType: WorkPreferenceInput['jobType']
  salaryRange: string
  requiredSkills: string[]
  description: string
  status: 'open' | 'draft' | 'closed'
  applicantsCount: number
  createdAt: string
}
