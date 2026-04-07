interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 rounded-2xl border border-border bg-surface p-5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="h-4 animate-pulse rounded-md bg-[linear-gradient(90deg,#e5edf5,#d7e2ee,#e5edf5)]"
          style={{ width: `${90 - index * 10}%` }}
        />
      ))}
    </div>
  )
}
