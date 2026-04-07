interface StatCardProps {
  label: string
  value: string | number
  helper?: string
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold text-ink">{value}</p>
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
    </article>
  )
}
