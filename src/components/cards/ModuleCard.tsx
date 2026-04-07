import type { LearningModule } from '../../types'

interface ModuleCardProps {
  module: LearningModule
  onToggleComplete?: (moduleId: string, completed: boolean) => void
  isUpdating?: boolean
}

export function ModuleCard({ module, onToggleComplete, isUpdating = false }: ModuleCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Modul {module.order}
          </p>
          <h3 className="mt-1 font-heading text-xl font-semibold text-ink">{module.title}</h3>
          <p className="mt-2 text-sm text-muted">{module.description}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            module.isCompleted ? 'bg-success-soft text-success' : 'bg-panel text-muted'
          }`}
        >
          {module.isCompleted ? 'Completed' : 'In Progress'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-border px-2 py-1 text-muted">
          {module.provider}
        </span>
        <span className="rounded-full border border-border px-2 py-1 text-muted">
          {module.level}
        </span>
        <span className="rounded-full border border-border px-2 py-1 text-muted">
          {module.durationHours} jam
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {module.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-panel px-2 py-1 text-xs text-muted">
            {skill}
          </span>
        ))}
      </div>

      {onToggleComplete ? (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onToggleComplete(module.id, !module.isCompleted)}
          className="mt-5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {module.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
      ) : null}
    </article>
  )
}
