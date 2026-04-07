interface ProgressStepperProps {
  steps: readonly string[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-6">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <li
            key={step}
            className={`rounded-xl border p-3 text-left transition ${
              isActive
                ? 'border-primary bg-primary-soft'
                : isCompleted
                  ? 'border-success/50 bg-success-soft'
                  : 'border-border bg-white'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">{step}</p>
          </li>
        )
      })}
    </ol>
  )
}
