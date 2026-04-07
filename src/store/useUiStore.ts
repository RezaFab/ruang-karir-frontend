import { create } from 'zustand'

export type ModuleFilter = 'all' | 'completed' | 'pending'
export type ModuleSort = 'sequence' | 'duration' | 'provider'
export type CandidateSort = 'readiness' | 'name'

interface UiState {
  moduleFilter: ModuleFilter
  moduleSort: ModuleSort
  candidateSort: CandidateSort
  setModuleFilter: (filter: ModuleFilter) => void
  setModuleSort: (sort: ModuleSort) => void
  setCandidateSort: (sort: CandidateSort) => void
}

export const useUiStore = create<UiState>((set) => ({
  moduleFilter: 'all',
  moduleSort: 'sequence',
  candidateSort: 'readiness',
  setModuleFilter: (filter) => set({ moduleFilter: filter }),
  setModuleSort: (sort) => set({ moduleSort: sort }),
  setCandidateSort: (sort) => set({ candidateSort: sort }),
}))
