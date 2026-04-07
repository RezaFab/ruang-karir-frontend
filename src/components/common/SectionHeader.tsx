interface SectionHeaderProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ title, subtitle, align = 'left' }: SectionHeaderProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h2 className="font-heading text-2xl font-semibold text-ink md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-muted md:text-base">{subtitle}</p> : null}
    </div>
  )
}
