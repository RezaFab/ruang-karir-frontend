interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Terjadi kendala saat memuat data.',
  description = 'Silakan coba beberapa saat lagi.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-danger/40 bg-danger-soft p-8 text-center">
      <h3 className="font-heading text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted md:text-base">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Coba Lagi
        </button>
      ) : null}
    </div>
  )
}
