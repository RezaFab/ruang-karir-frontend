import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight text-ink">
            Ruang Karir
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <a href="#masalah" className="hover:text-ink">
              Masalah
            </a>
            <a href="#cara-kerja" className="hover:text-ink">
              Cara Kerja
            </a>
            <a href="#manfaat" className="hover:text-ink">
              Manfaat
            </a>
          </nav>
          <Link
            to="/assessment"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Mulai Assessment
          </Link>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-border bg-panel">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <h3 className="font-heading text-xl font-semibold text-ink">Ruang Karir</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Platform AI untuk membantu transisi karier melalui asesmen personal, rekomendasi role, dan
            learning path berbasis kebutuhan industri.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.12em] text-muted">
            Demo frontend backend-ready untuk presentasi lomba
          </p>
        </div>
      </footer>
    </div>
  )
}
