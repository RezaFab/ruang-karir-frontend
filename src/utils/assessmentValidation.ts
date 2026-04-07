import type { AssessmentDraft } from '../types'

export type AssessmentStep = 0 | 1 | 2 | 3 | 4 | 5
export type ValidationErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateBasicProfile(draft: AssessmentDraft): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!draft.basicProfile.fullName.trim()) {
    errors.fullName = 'Nama lengkap wajib diisi.'
  }

  if (!draft.basicProfile.email.trim()) {
    errors.email = 'Email wajib diisi.'
  } else if (!EMAIL_PATTERN.test(draft.basicProfile.email)) {
    errors.email = 'Format email tidak valid.'
  }

  if (!draft.basicProfile.currentRole.trim()) {
    errors.currentRole = 'Role saat ini wajib diisi.'
  }

  if (!draft.basicProfile.educationLevel.trim()) {
    errors.educationLevel = 'Pendidikan terakhir wajib diisi.'
  }

  if (!draft.basicProfile.city.trim()) {
    errors.city = 'Kota domisili wajib diisi.'
  }

  return errors
}

function validateWorkPreferences(draft: AssessmentDraft): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!draft.workPreferences.preferredIndustries.length) {
    errors.preferredIndustries = 'Pilih minimal satu industri yang diminati.'
  }

  return errors
}

function validateExistingSkills(draft: AssessmentDraft): ValidationErrors {
  const errors: ValidationErrors = {}

  if (draft.existingSkills.length < 2) {
    errors.existingSkills = 'Masukkan minimal dua skill yang sudah kamu miliki.'
  }

  return errors
}

function validateExperience(draft: AssessmentDraft): ValidationErrors {
  const errors: ValidationErrors = {}

  if (draft.experience.years < 0) {
    errors.years = 'Pengalaman kerja tidak boleh bernilai negatif.'
  }

  if (!draft.experience.highlights.trim()) {
    errors.highlights = 'Ceritakan pengalaman atau proyek utama kamu.'
  }

  return errors
}

function validateLearningPreference(draft: AssessmentDraft): ValidationErrors {
  const errors: ValidationErrors = {}

  if (draft.learningPreferences.weeklyHours < 2) {
    errors.weeklyHours = 'Minimal alokasi belajar adalah 2 jam per minggu.'
  }

  return errors
}

export function validateAssessmentStep(step: AssessmentStep, draft: AssessmentDraft): ValidationErrors {
  if (step === 0) {
    return validateBasicProfile(draft)
  }

  if (step === 1) {
    return validateWorkPreferences(draft)
  }

  if (step === 2) {
    return validateExistingSkills(draft)
  }

  if (step === 3) {
    return validateExperience(draft)
  }

  if (step === 4) {
    return {}
  }

  return validateLearningPreference(draft)
}
