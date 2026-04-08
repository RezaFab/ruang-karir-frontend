export const queryKeys = {
  userProfile: () => ['user-profile'] as const,
  careerGoals: () => ['career-goals'] as const,
  assessmentsMe: () => ['assessments', 'me'] as const,
  industryTrends: () => ['industry-trends'] as const,
  badges: () => ['badges'] as const,
  companyCandidates: () => ['company', 'candidates'] as const,
  jobRecommendations: () => ['jobs', 'recommendations'] as const,
  companyJobs: () => ['company', 'jobs'] as const,
  recommendations: (assessmentId: string, selectedCareerGoalId?: string) =>
    ['recommendations', assessmentId, selectedCareerGoalId ?? 'none'] as const,
  learningPath: (learningPathId: string) => ['learning-path', learningPathId] as const,
  progressSummary: (learningPathId: string) => ['progress-summary', learningPathId] as const,
} as const
