export const endpoints = {
  careerGoals: '/api/career-goals',
  assessments: '/api/assessments',
  recommendations: '/api/recommendations',
  learningPathById: (id: string) => `/api/learning-paths/${id}`,
  learningPathProgress: (id: string) => `/api/learning-paths/${id}/progress`,
  badges: '/api/badges',
  industryTrends: '/api/industry-trends',
  companyCandidates: '/api/company/candidates',
  progressSummaryByPath: (learningPathId: string) => `/api/progress/${learningPathId}`,
  userProfile: '/api/user/profile',
} as const
