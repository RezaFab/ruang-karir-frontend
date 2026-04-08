import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../hooks/useAuth'

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Semua field wajib diisi.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak sesuai.')
      return
    }

    registerMutation.mutate(
      {
        fullName,
        username,
        email,
        password,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Akun berhasil dibuat. Silakan login dengan akun baru kamu.')
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Gagal membuat akun.')
        },
      },
    )
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
      <article className="rounded-3xl border border-border bg-[linear-gradient(135deg,#13334d,#1f6f8b_55%,#7bc7ba)] p-8 text-white shadow-[0_24px_70px_rgba(14,30,46,0.22)] md:p-10">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
          Buat Akun
        </p>
        <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight md:text-5xl">
          Mulai Perjalanan Kariermu
        </h1>
        <p className="mt-4 text-sm text-white/90 md:text-base">
          Buat akun Ruang Karir untuk mendapatkan asesmen personal, rekomendasi peran, dan roadmap belajar.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-white/95">
          <li className="rounded-xl border border-white/20 bg-white/10 p-3">Asesmen AI berbasis profilmu</li>
          <li className="rounded-xl border border-white/20 bg-white/10 p-3">
            Jalur belajar personal sesuai skill gap
          </li>
          <li className="rounded-xl border border-white/20 bg-white/10 p-3">Pelacak progres untuk target karier</li>
        </ul>
      </article>

      <article className="rounded-3xl border border-border bg-white p-8 shadow-[0_18px_50px_rgba(14,30,46,0.14)] md:p-10">
        <h2 className="font-heading text-3xl font-semibold text-ink">Buat Akun</h2>
        <p className="mt-2 text-sm text-muted">Daftarkan akun baru untuk mulai menggunakan Ruang Karir.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-ink">Nama lengkap</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Contoh: Reza Lesmana"
              className="input-field"
              disabled={registerMutation.isPending}
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-ink">Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Contoh: rezalesmana"
              className="input-field"
              disabled={registerMutation.isPending}
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              className="input-field"
              disabled={registerMutation.isPending}
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-ink">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className="input-field"
              disabled={registerMutation.isPending}
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-ink">Konfirmasi password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi password"
              className="input-field"
              disabled={registerMutation.isPending}
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
            disabled={registerMutation.isPending}
            className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {registerMutation.isPending ? 'Membuat akun...' : 'Buat Akun'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sudah punya akun? Masuk
          </Link>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-primary hover:underline"
          >
            Lanjut ke Halaman Masuk
          </button>
        </div>
      </article>
    </section>
  )
}
