export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function formatDate(value: string): string {
  const date = new Date(value)

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function toSentenceCase(value: string): string {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}
