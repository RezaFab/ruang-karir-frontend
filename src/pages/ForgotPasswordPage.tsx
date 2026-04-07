import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '../hooks/useAuth'

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation()
  const [identifier, setIdentifier] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!identifier.trim()) {
      setErrorMessage('Masukkan username atau email terlebih dahulu.')
      return
    }

    forgotPasswordMutation.mutate(
      {
        identifier,
      },
      {
        onSuccess: (response) => {
          setSuccessMessage(
            `Link reset password dikirim ke ${response.maskedDestination} dan berlaku ${response.expiresInMinutes} menit.`,
          )
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Gagal memproses permintaan reset password.')
        },
      },
    )
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[1fr_1fr] md:items-stretch">
      <article className="rounded-3xl border border-border bg-[linear-gradient(135deg,#1f6f8b,#0e1e2e)] p-8 text-white shadow-[0_24px_70px_rgba(14,30,46,0.22)] md:p-10">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
          Lupa Password
        </p>
        <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight md:text-5xl">
          Reset Password Akunmu
        </h1>
        <p className="mt-4 text-sm text-white/90 md:text-base">
          Masukkan username atau email yang terdaftar. Kami akan kirim link reset password ke email kamu.
        </p>
      </article>

      <article className="rounded-3xl border border-border bg-white p-8 shadow-[0_18px_50px_rgba(14,30,46,0.14)] md:p-10">
        <h2 className="font-heading text-3xl font-semibold text-ink">Lupa Password</h2>
        <p className="mt-2 text-sm text-muted">
          Gunakan username atau email. Untuk demo, link reset dikirim secara simulasi.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-ink">Username / Email</span>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Contoh: RuangKarirAdmin atau email"
              className="input-field"
              disabled={forgotPasswordMutation.isPending}
            />
          </label>

          {errorMessage ? (
            <p className="rounded-xl border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl border border-success/40 bg-success-soft px-3 py-2 text-sm text-success">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {forgotPasswordMutation.isPending ? 'Memproses...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Kembali ke Login
          </Link>
          <Link to="/create-account" className="font-semibold text-primary hover:underline">
            Buat Akun Baru
          </Link>
        </div>
      </article>
    </section>
  )
}
