import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { careerApiService, queryKeys } from '../services'
import type {
  CreateCompanyJobPostRequest,
  RecommendationRequest,
  SubmitAssessmentRequest,
  UpdateLearningProgressRequest,
} from '../types'

export function useUserProfileQuery() {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: async () => {
      const response = await careerApiService.getUserProfile()
      return response.data
    },
  })
}

export function useCareerGoalsQuery() {
  return useQuery({
    queryKey: queryKeys.careerGoals(),
    queryFn: async () => {
      const response = await careerApiService.getCareerGoals()
      return response.data
    },
  })
}

export function useMyAssessmentsQuery() {
  return useQuery({
    queryKey: queryKeys.assessmentsMe(),
    queryFn: async () => {
      const response = await careerApiService.getMyAssessments()
      return response.data
    },
  })
}

export function useIndustryTrendsQuery() {
  return useQuery({
    queryKey: queryKeys.industryTrends(),
    queryFn: async () => {
      const response = await careerApiService.getIndustryTrends()
      return response.data
    },
  })
}

export function useBadgesQuery() {
  return useQuery({
    queryKey: queryKeys.badges(),
    queryFn: async () => {
      const response = await careerApiService.getBadges()
      return response.data
    },
  })
}

export function useCompanyCandidatesQuery() {
  return useQuery({
    queryKey: queryKeys.companyCandidates(),
    queryFn: async () => {
      const response = await careerApiService.getCompanyCandidates()
      return response.data
    },
  })
}

export function useJobRecommendationsQuery() {
  return useQuery({
    queryKey: queryKeys.jobRecommendations(),
    queryFn: async () => {
      const response = await careerApiService.getJobRecommendations()
      return response.data
    },
  })
}

export function useCompanyJobsQuery() {
  return useQuery({
    queryKey: queryKeys.companyJobs(),
    queryFn: async () => {
      const response = await careerApiService.getCompanyJobs()
      return response.data
    },
  })
}

export function useLearningPathQuery(pathId: string | undefined) {
  return useQuery({
    queryKey: pathId ? queryKeys.learningPath(pathId) : ['learning-path', 'empty'],
    queryFn: async () => {
      if (!pathId) {
        throw new Error('Learning path id is required.')
      }

      const response = await careerApiService.getLearningPathById(pathId)
      return response.data
    },
    enabled: Boolean(pathId),
  })
}

export function useProgressSummaryQuery(pathId: string | undefined) {
  return useQuery({
    queryKey: pathId ? queryKeys.progressSummary(pathId) : ['progress-summary', 'empty'],
    queryFn: async () => {
      if (!pathId) {
        throw new Error('Learning path id is required.')
      }

      const response = await careerApiService.getProgressSummary(pathId)
      return response.data
    },
    enabled: Boolean(pathId),
  })
}

export function useSubmitAssessmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SubmitAssessmentRequest) => {
      const response = await careerApiService.submitAssessment(payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessmentsMe() })
    },
  })
}

export function useRecommendationMutation() {
  return useMutation({
    mutationFn: async (payload: RecommendationRequest) => {
      const response = await careerApiService.getRecommendations(payload)
      return response.data
    },
  })
}

export function useUpdateLearningPathProgressMutation(pathId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateLearningProgressRequest) => {
      if (!pathId) {
        throw new Error('Learning path id is required.')
      }

      const response = await careerApiService.updateLearningPathProgress(pathId, payload)
      return response.data
    },
    onSuccess: () => {
      if (!pathId) {
        return
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.learningPath(pathId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.progressSummary(pathId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.badges() })
    },
  })
}

export function useCreateCompanyJobMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCompanyJobPostRequest) => {
      const response = await careerApiService.createCompanyJob(payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyJobs() })
    },
  })
}
