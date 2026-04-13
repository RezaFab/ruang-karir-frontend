import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useGoogleLoginMutation, useLoginMutation } from '../hooks/useAuth'
import { useSessionStore } from '../store'
import type { LoginResponseData } from '../types'

const DEFAULT_REDIRECT = '/dashboard'
const MAX_AUTH_BUTTON_WIDTH = 400

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useSessionStore((state) => state.setSession)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isGoogleReady, setIsGoogleReady] = useState(false)

  const loginMutation = useLoginMutation()
  const googleLoginMutation = useGoogleLoginMutation()
  const triggerGoogleLogin = googleLoginMutation.mutate
  const isSubmitting = loginMutation.isPending

  const redirectTarget = useMemo(() => {
    const rawTarget = searchParams.get('redirect')

    if (!rawTarget || !rawTarget.startsWith('/')) {
      return DEFAULT_REDIRECT
    }

    return rawTarget
  }, [searchParams])
  const infoMessage = !googleClientId ? 'Google SSO belum dikonfigurasi di aplikasi ini.' : ''

  const handleAuthSuccess = useCallback(
    (sessionData: LoginResponseData) => {
      const nextRoute =
        redirectTarget !== DEFAULT_REDIRECT
          ? redirectTarget
          : sessionData.role === 'company'
            ? '/company/jobs'
            : '/dashboard'

      setSession(sessionData)
      navigate(nextRoute, { replace: true })
    },
    [navigate, redirectTarget, setSession],
  )

  useEffect(() => {
    if (!googleClientId) {
      return
    }

    const scriptId = 'google-identity-services-script'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null

    const initializeGoogleButton = () => {
      const google = window.google
      const buttonContainer = googleButtonRef.current

      if (!google || !buttonContainer) {
        return
      }

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          const idToken = response.credential?.trim()

          if (!idToken) {
            setErrorMessage('Token Google tidak ditemukan. Silakan coba lagi.')
            return
          }

          setErrorMessage('')
          triggerGoogleLogin(
            { idToken },
            {
              onSuccess: (sessionData) => {
                handleAuthSuccess(sessionData)
              },
              onError: (error) => {
                setErrorMessage(error instanceof Error ? error.message : 'Masuk dengan Google gagal.')
              },
            },
          )
        },
      })

      buttonContainer.innerHTML = ''
      const computedWidth = Math.max(
        260,
        Math.min(Math.floor(buttonContainer.clientWidth || MAX_AUTH_BUTTON_WIDTH), MAX_AUTH_BUTTON_WIDTH),
      )
      google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        width: computedWidth,
        text: 'signin_with',
        logo_alignment: 'left',
      })
      setIsGoogleReady(true)
    }

    if (window.google?.accounts?.id) {
      initializeGoogleButton()
      return
    }

    const scriptElement =
      existingScript ??
      Object.assign(document.createElement('script'), {
        id: scriptId,
        src: 'https://accounts.google.com/gsi/client',
        async: true,
        defer: true,
      })

    if (!existingScript) {
      document.head.append(scriptElement)
    }

    const handleScriptError = () => {
      setErrorMessage('Gagal memuat layanan Google. Periksa koneksi lalu coba lagi.')
      setIsGoogleReady(false)
    }

    scriptElement.addEventListener('load', initializeGoogleButton)
    scriptElement.addEventListener('error', handleScriptError)

    return () => {
      scriptElement.removeEventListener('load', initializeGoogleButton)
      scriptElement.removeEventListener('error', handleScriptError)
    }
  }, [googleClientId, handleAuthSuccess, triggerGoogleLogin])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

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
          handleAuthSuccess(sessionData)
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Login gagal. Coba lagi.')
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
          <label className="mx-auto block w-full max-w-[400px] space-y-2">
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

          <div className="mx-auto w-full max-w-[400px] space-y-2">
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
            <p className="mx-auto w-full max-w-[400px] rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">
              {errorMessage}
            </p>
          ) : null}

          {infoMessage ? (
            <p className="mx-auto w-full max-w-[400px] rounded-md border border-primary/30 bg-primary-soft px-3 py-2 text-sm text-primary">
              {infoMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mx-auto mt-2 block h-12 w-full max-w-[400px] rounded-md bg-[#238636] text-base font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Sedang masuk...' : 'Masuk'}
          </button>

          <div className="mx-auto my-1 flex w-full max-w-[400px] items-center gap-4 py-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted">atau</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mx-auto min-h-12 w-full max-w-[400px]">
            <div ref={googleButtonRef} className="w-full overflow-hidden rounded-md" />
            {googleClientId && !isGoogleReady ? (
              <button
                type="button"
                disabled
                className="h-12 w-full rounded-md border border-border bg-panel text-sm font-semibold text-muted"
              >
                Memuat tombol Google...
              </button>
            ) : null}
          </div>
        </form>

        <p className="mt-8 text-center text-base text-ink">
          Baru di Ruang Karir?{' '}
          <Link to="/create-account" className="font-semibold text-primary hover:underline">
            Buat akun
          </Link>
        </p>
      </article>
    </section>
  )
}
