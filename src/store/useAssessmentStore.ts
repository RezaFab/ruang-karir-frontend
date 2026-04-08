import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  AssessmentDraft,
  BasicProfileInput,
  ExperienceInput,
  LearningPreferenceInput,
  WorkPreferenceInput,
} from '../types'

function createInitialDraft(): AssessmentDraft {
  return {
    basicProfile: {
      fullName: '',
      email: '',
      currentRole: '',
      educationLevel: '',
      city: '',
    },
    workPreferences: {
      workMode: 'hybrid',
      jobType: 'full-time',
      preferredIndustries: [],
    },
    existingSkills: [],
    experience: {
      years: 0,
      highlights: '',
    },
    careerGoalId: undefined,
    learningPreferences: {
      pace: 'balanced',
      weeklyHours: 6,
      style: 'mixed',
    },
  }
}

const initialDraft = createInitialDraft()

interface AssessmentState {
  draft: AssessmentDraft
  latestAssessmentId?: string
  selectedCareerGoalId?: string
  updateBasicProfile: (payload: Partial<BasicProfileInput>) => void
  updateWorkPreferences: (payload: Partial<WorkPreferenceInput>) => void
  setExistingSkills: (skills: string[]) => void
  updateExperience: (payload: Partial<ExperienceInput>) => void
  setCareerGoalId: (careerGoalId?: string) => void
  updateLearningPreferences: (payload: Partial<LearningPreferenceInput>) => void
  setLatestAssessmentId: (assessmentId: string) => void
  setSelectedCareerGoalId: (careerGoalId?: string) => void
  resetDraft: () => void
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      latestAssessmentId: undefined,
      selectedCareerGoalId: undefined,
      updateBasicProfile: (payload) =>
        set((state) => ({
          draft: {
            ...state.draft,
            basicProfile: {
              ...state.draft.basicProfile,
              ...payload,
            },
          },
        })),
      updateWorkPreferences: (payload) =>
        set((state) => ({
          draft: {
            ...state.draft,
            workPreferences: {
              ...state.draft.workPreferences,
              ...payload,
            },
          },
        })),
      setExistingSkills: (skills) =>
        set((state) => ({
          draft: {
            ...state.draft,
            existingSkills: skills,
          },
        })),
      updateExperience: (payload) =>
        set((state) => ({
          draft: {
            ...state.draft,
            experience: {
              ...state.draft.experience,
              ...payload,
            },
          },
        })),
      setCareerGoalId: (careerGoalId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            careerGoalId,
          },
          selectedCareerGoalId: careerGoalId,
        })),
      updateLearningPreferences: (payload) =>
        set((state) => ({
          draft: {
            ...state.draft,
            learningPreferences: {
              ...state.draft.learningPreferences,
              ...payload,
            },
          },
        })),
      setLatestAssessmentId: (assessmentId) => set({ latestAssessmentId: assessmentId }),
      setSelectedCareerGoalId: (careerGoalId) => set({ selectedCareerGoalId: careerGoalId }),
      resetDraft: () =>
        set({
          draft: createInitialDraft(),
          latestAssessmentId: undefined,
          selectedCareerGoalId: undefined,
        }),
    }),
    {
      name: 'ruang-karir-assessment',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draft: state.draft,
        latestAssessmentId: state.latestAssessmentId,
        selectedCareerGoalId: state.selectedCareerGoalId,
      }),
    },
  ),
)
