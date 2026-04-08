import { useEffect, useMemo, useRef, useState } from 'react'

export interface AppDropdownOption {
  value: string
  label: string
}

interface AppDropdownProps {
  value: string
  options: AppDropdownOption[]
  onChange: (value: string) => void
  ariaLabel: string
  disabled?: boolean
  className?: string
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AppDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  className = '',
}: AppDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const activeOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) {
        return
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-xl border border-border bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-3 py-2.5 text-sm font-semibold text-ink shadow-[0_3px_14px_rgba(15,23,42,0.06)] transition hover:border-primary/60 hover:shadow-[0_6px_20px_rgba(31,111,139,0.2)] focus:outline-none focus:ring-2 focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen ? 'border-primary shadow-[0_8px_24px_rgba(31,111,139,0.24)]' : ''
        }`}
      >
        <span>{activeOption?.label ?? '-'}</span>
        <span className={`text-muted transition ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 max-h-60 overflow-auto rounded-2xl border border-border bg-white/95 p-1.5 shadow-[0_18px_38px_rgba(15,23,42,0.18)] backdrop-blur"
        >
          {options.map((option) => {
            const isActive = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition last:mb-0 ${
                  isActive
                    ? 'bg-[linear-gradient(120deg,#0f2740,#1f6f8b)] text-white'
                    : 'text-ink hover:bg-panel'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
