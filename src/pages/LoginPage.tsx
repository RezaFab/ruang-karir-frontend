import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useGoogleLoginMutation, useLoginMutation } from '../hooks/useAuth'
import { useSessionStore } from '../store'

const DEFAULT_REDIRECT = '/dashboard'
const DUMMY_GOOGLE_ID_TOKEN = 'dummy-google-token-login-page'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="#FFC107"
        d="M43.61 20.08H42V20H24v8h11.3C33.66 32.66 29.24 36 24 36c-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.28 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
      />
      <path
        fill="#FF3D00"
        d="m6.31 14.69 6.57 4.82C14.65 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.28 4 24 4c-7.69 0-14.35 4.34-17.69 10.69Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.17 0 9.86-1.98 13.41-5.19l-6.19-5.24C29.14 35.09 26.72 36 24 36c-5.21 0-9.62-3.32-11.29-7.95l-6.52 5.03C9.5 39.56 16.23 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.61 20.08H42V20H24v8h11.3a12 12 0 0 1-6.08 7.57l6.19 5.24C39 37.6 44 31.31 44 24c0-1.34-.14-2.65-.39-3.92Z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useSessionStore((state) => state.setSession)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const loginMutation = useLoginMutation()
  const googleLoginMutation = useGoogleLoginMutation()
  const isSubmitting = loginMutation.isPending || googleLoginMutation.isPending

  const redirectTarget = useMemo(() => {
    const rawTarget = searchParams.get('redirect')

    if (!rawTarget || !rawTarget.startsWith('/')) {
      return DEFAULT_REDIRECT
    }

    return rawTarget
  }, [searchParams])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Username/email dan password wajib diisi.')
      return
    }

    loginMutation.mutate(
      {
        identifier,
        password,
      },
      {
        onSuccess: (sessionData) => {
          setSession(sessionData)
          navigate(redirectTarget, { replace: true })
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Login gagal. Coba lagi.')
        },
      },
    )
  }

  function handleGoogleLogin() {
    setErrorMessage('')
    setInfoMessage('')

    googleLoginMutation.mutate(
      {
        idToken: DUMMY_GOOGLE_ID_TOKEN,
      },
      {
        onSuccess: (sessionData) => {
          setSession(sessionData)
          navigate(redirectTarget, { replace: true })
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Login Google gagal. Coba lagi.')
        },
      },
    )
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
      <article className="rounded-3xl border border-border bg-[linear-gradient(135deg,#12324b,#1f6f8b_55%,#7bc7ba)] p-8 text-white shadow-[0_24px_70px_rgba(14,30,46,0.22)] md:p-10">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
          Selamat Datang Kembali
        </p>
        <h2 className="mt-5 font-heading text-4xl font-semibold leading-tight md:text-5xl">
          Lanjutkan Perjalanan Kariermu
        </h2>
        <p className="mt-4 text-sm text-white/90 md:text-base">
          Masuk untuk melanjutkan assessment, melihat progress belajar, dan menjalankan learning path
          personalmu.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-white/95">
          <li className="rounded-xl border border-white/20 bg-white/10 p-3">
            Asesmen AI berbasis profil dan tujuan karier
          </li>
          <li className="rounded-xl border border-white/20 bg-white/10 p-3">
            Roadmap belajar personal sesuai skill gap
          </li>
          <li className="rounded-xl border border-white/20 bg-white/10 p-3">
            Pelacak progres dan lencana pencapaian
          </li>
        </ul>
      </article>

      <article className="rounded-2xl border border-border bg-white p-8 shadow-[0_18px_50px_rgba(14,30,46,0.12)]">
        <h1 className="mb-6 text-center font-heading text-3xl font-semibold text-ink">Masuk</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Username atau alamat email</span>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Masukkan username atau email"
              autoComplete="username"
              disabled={isSubmitting}
              className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Password</span>
              <Link to="/forgot-password" className="text-sm font-medium text-primary transition hover:underline">
                Lupa password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              disabled={isSubmitting}
              className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">
              {errorMessage}
            </p>
          ) : null}

          {infoMessage ? (
            <p className="rounded-md border border-primary/30 bg-primary-soft px-3 py-2 text-sm text-primary">
              {infoMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full rounded-md bg-[#238636] text-base font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Sedang masuk...' : 'Masuk'}
          </button>

          <div className="my-1 flex items-center gap-4 py-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted">atau</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-panel text-base font-semibold text-ink transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoginMutation.isPending ? 'Menghubungkan Google...' : 'Masuk dengan Google'}
          </button>
        </form>

        <p className="mt-8 text-center text-base text-ink">
          Baru di Ruang Karir?{' '}
          <Link to="/create-account" className="font-semibold text-primary hover:underline">
            Buat akun
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setInfoMessage('Masuk dengan passkey masih dummy/placeholder.')}
          className="mt-4 w-full text-center text-base font-semibold text-primary transition hover:underline"
        >
          Masuk dengan passkey
        </button>
      </article>
    </section>
  )
}
