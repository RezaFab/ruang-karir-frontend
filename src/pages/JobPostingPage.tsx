import { useMemo, useState, type FormEvent } from 'react'
import { EmptyState, ErrorState, LoadingSkeleton, SectionHeader } from '../components'
import { useCompanyJobsQuery, useCreateCompanyJobMutation } from '../hooks/useCareerApi'
import { formatDate } from '../utils'

const workModes = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
] as const

const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
] as const

const jobPageSizeOptions = [10, 25, 50, 100] as const

export default function JobPostingPage() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [description, setDescription] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('hybrid')
  const [jobType, setJobType] = useState<'full-time' | 'contract' | 'freelance'>('full-time')

  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'draft' | 'closed'>('all')
  const [workModeFilter, setWorkModeFilter] = useState<'all' | 'remote' | 'hybrid' | 'onsite'>('all')
  const [jobTypeFilter, setJobTypeFilter] = useState<'all' | 'full-time' | 'contract' | 'freelance'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(jobPageSizeOptions[0])

  const { data: jobs, isLoading, isError, refetch } = useCompanyJobsQuery()
  const createJobMutation = useCreateCompanyJobMutation()

  const orderedJobs = useMemo(
    () => [...(jobs ?? [])].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    [jobs],
  )
  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase()

    return orderedJobs.filter((job) => {
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false
      }

      if (workModeFilter !== 'all' && job.workMode !== workModeFilter) {
        return false
      }

      if (jobTypeFilter !== 'all' && job.jobType !== jobTypeFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableText = [job.title, job.location, job.description, ...job.requiredSkills]
        .join(' ')
        .toLowerCase()
      return searchableText.includes(normalizedSearch)
    })
  }, [jobTypeFilter, orderedJobs, searchInput, statusFilter, workModeFilter])
  const totalItems = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(page, totalPages)
  const paginatedJobs = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return filteredJobs.slice(startIndex, startIndex + pageSize)
  }, [activePage, filteredJobs, pageSize])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const requiredSkills = skillsText
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

    if (!title.trim() || !location.trim() || !salaryRange.trim() || !description.trim() || requiredSkills.length === 0) {
      return
    }

    createJobMutation.mutate(
      {
        title: title.trim(),
        location: location.trim(),
        salaryRange: salaryRange.trim(),
        workMode,
        jobType,
        requiredSkills,
        description: description.trim(),
      },
      {
        onSuccess: () => {
          setTitle('')
          setLocation('')
          setSalaryRange('')
          setDescription('')
          setSkillsText('')
          setWorkMode('hybrid')
          setJobType('full-time')
        },
      },
    )
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPage(1)
  }

  function handleStatusFilterChange(value: 'all' | 'open' | 'draft' | 'closed') {
    setStatusFilter(value)
    setPage(1)
  }

  function handleWorkModeFilterChange(value: 'all' | 'remote' | 'hybrid' | 'onsite') {
    setWorkModeFilter(value)
    setPage(1)
  }

  function handleJobTypeFilterChange(value: 'all' | 'full-time' | 'contract' | 'freelance') {
    setJobTypeFilter(value)
    setPage(1)
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value)
    setPage(1)
  }

  function handlePreviousPage() {
    if (activePage <= 1) {
      return
    }

    setPage(activePage - 1)
  }

  function handleNextPage() {
    if (activePage >= totalPages) {
      return
    }

    setPage(activePage + 1)
  }

  if (isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Data posting job belum bisa dimuat"
        description="Periksa koneksi API perusahaan atau coba lagi beberapa saat."
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Posting Job"
        subtitle="Publikasikan lowongan, pantau status, dan lihat jumlah pelamar secara cepat."
      />

      <article className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-semibold text-ink">Buat Lowongan Baru</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-ink">Judul posisi</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="input-field"
              placeholder="Contoh: Data Analyst (Junior)"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-ink">Lokasi</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="input-field"
              placeholder="Contoh: Bandung"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-ink">Mode kerja</span>
            <select
              value={workMode}
              onChange={(event) => setWorkMode(event.target.value as 'remote' | 'hybrid' | 'onsite')}
              className="input-field"
            >
              {workModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-ink">Tipe kerja</span>
            <select
              value={jobType}
              onChange={(event) =>
                setJobType(event.target.value as 'full-time' | 'contract' | 'freelance')
              }
              className="input-field"
            >
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-ink">Rentang gaji</span>
            <input
              value={salaryRange}
              onChange={(event) => setSalaryRange(event.target.value)}
              className="input-field"
              placeholder="Contoh: Rp8.000.000 - Rp12.000.000"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-ink">Skill requirement (pisahkan koma)</span>
            <input
              value={skillsText}
              onChange={(event) => setSkillsText(event.target.value)}
              className="input-field"
              placeholder="Contoh: SQL, Tableau, Communication"
            />
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-ink">Deskripsi</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="input-field"
              placeholder="Jelaskan tanggung jawab utama posisi ini."
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createJobMutation.isPending}
              className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createJobMutation.isPending ? 'Menyimpan...' : 'Publikasikan Lowongan'}
            </button>
          </div>
        </form>
      </article>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Daftar Posting Job</h3>

        {!orderedJobs.length ? (
          <EmptyState
            title="Belum ada posting lowongan"
            description="Buat lowongan pertama untuk mulai menjaring kandidat."
          />
        ) : (
          <>
            <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="w-full max-w-xl space-y-1.5 text-sm">
                  <span className="font-medium text-ink">Cari lowongan</span>
                  <input
                    value={searchInput}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Cari judul, lokasi, atau skill"
                    className="input-field"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowFilters((previous) => !previous)}
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
                >
                  {showFilters ? 'Tutup Filter' : 'Filter'}
                </button>
              </div>

              {showFilters ? (
                <div className="space-y-3 rounded-xl border border-border bg-white p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['all', 'open', 'draft', 'closed'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusFilterChange(status)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            statusFilter === status
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-border text-muted hover:bg-panel'
                          }`}
                        >
                          {status === 'all' ? 'Semua' : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Mode Kerja</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['all', 'remote', 'hybrid', 'onsite'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleWorkModeFilterChange(mode)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            workModeFilter === mode
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-border text-muted hover:bg-panel'
                          }`}
                        >
                          {mode === 'all' ? 'Semua' : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Tipe Kerja</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['all', 'full-time', 'contract', 'freelance'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleJobTypeFilterChange(type)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            jobTypeFilter === type
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-border text-muted hover:bg-panel'
                          }`}
                        >
                          {type === 'all' ? 'Semua' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            {totalItems === 0 ? (
              <EmptyState
                title="Tidak ada posting yang cocok"
                description="Coba ubah kata kunci pencarian atau filter daftar posting."
              />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {paginatedJobs.map((job) => (
                    <article key={job.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h4 className="font-heading text-lg font-semibold text-ink">{job.title}</h4>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            job.status === 'open'
                              ? 'bg-success-soft text-success'
                              : job.status === 'draft'
                                ? 'bg-panel text-muted'
                                : 'bg-danger-soft text-danger'
                          }`}
                        >
                          {job.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted">
                        {job.location} | {job.workMode} | {job.jobType}
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">{job.salaryRange}</p>
                      <p className="mt-3 text-sm text-muted">{job.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <span key={skill} className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted">
                        <p>Dibuat {formatDate(job.createdAt)}</p>
                        <p>{job.applicantsCount} pelamar</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex flex-wrap items-center gap-3 text-muted">
                    <label className="flex items-center">
                      <select
                        value={pageSize}
                        onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                        aria-label="Jumlah data per halaman"
                        className="input-field min-w-[100px] py-1.5"
                      >
                        {jobPageSizeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span>
                      Menampilkan {paginatedJobs.length} dari {totalItems} lowongan | Halaman {activePage}/
                      {totalPages}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={activePage <= 1}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={activePage >= totalPages}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </section>
  )
}
