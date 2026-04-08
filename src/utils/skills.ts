export function normalizeSkillName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function toSkillKey(value: string): string {
  return normalizeSkillName(value).toLowerCase()
}

export function dedupeSkillNames(skills: string[]): string[] {
  const seen = new Set<string>()
  const deduped: string[] = []

  skills.forEach((skill) => {
    const normalizedSkill = normalizeSkillName(skill)
    const key = toSkillKey(normalizedSkill)

    if (!normalizedSkill || seen.has(key)) {
      return
    }

    seen.add(key)
    deduped.push(normalizedSkill)
  })

  return deduped
}
