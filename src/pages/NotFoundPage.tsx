import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-white p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">404</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-muted">
          URL yang kamu akses tidak tersedia di prototype Ruang Karir.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Kembali ke Landing
        </Link>
      </div>
    </div>
  )
}
