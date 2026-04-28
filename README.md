# Ruang Karir Frontend

Frontend aplikasi **Ruang Karir** berbasis React + TypeScript dengan mode **full API** (tanpa mock/dummy data di runtime).

Live URL : https://ruang-karir-frontend.vercel.app/

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- TanStack Query
- Zustand
- lozad.js
- Priority Hints (`fetchpriority`)

## Prasyarat

- Node.js 20+ (disarankan LTS)
- NPM
- Server Ruang Karir berjalan di lokal

## Menjalankan Project

```bash
npm install
cp .env.example .env.local
npm run dev
```

Build dan quality check:

```bash
npm run build
npm run lint
npx tsc -b
```

## Konfigurasi Environment

`.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

Semua request akan diarahkan ke `${VITE_API_BASE_URL}/api/*`.

## Arsitektur Singkat

- `src/pages` -> container tiap halaman/fitur.
- `src/components` -> komponen reusable (UI, card, panel, skeleton, dsb).
- `src/layouts` -> `PublicLayout` dan `AppLayout`.
- `src/routes` -> route tree + guard (`ProtectedRoute`, `RoleRoute`, `PublicOnlyRoute`).
- `src/services` -> kontrak endpoint, HTTP client, service auth/career, query keys, util pagination.
- `src/hooks` -> hook Query/Mutation (`useCareerApi`, `useAuth`).
- `src/store` -> global state Zustand (session, assessment draft, UI state).
- `src/types` -> seluruh tipe request/response.

## Data & API Contract

Frontend mengonsumsi envelope response:

```json
{
  "data": {},
  "message": "string",
  "meta": {
    "requestId": "string",
    "timestamp": "ISO string"
  }
}
```

### Endpoint yang dipakai FE

Auth:

- `POST /api/auth/login`
- `POST /api/auth/google-login` (dipanggil dari tombol masuk Google)
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Data utama:

- `GET /api/user/profile`
- `GET /api/career-goals`
- `POST /api/assessments`
- `GET /api/assessments/me`
- `POST /api/recommendations`
- `GET /api/learning-paths/:id`
- `PATCH /api/learning-paths/:id/progress`
- `GET /api/progress/:learningPathId`
- `GET /api/badges`
- `GET /api/industry-trends`
- `GET /api/company/candidates`
- `GET /api/jobs/recommendations`
- `GET /api/company/jobs`
- `POST /api/company/jobs`

Skill catalog:

- `GET /api/skills?search=&page=&length=`
- `POST /api/skills`

## Auth Behavior di FE

- Access token disimpan di Zustand store (`useSessionStore`) dan dipakai pada header `Authorization: Bearer`.
- Refresh token dibaca dari header `x-refresh-token`.
- Saat akses protected endpoint mendapat `401`, FE otomatis mencoba `POST /api/auth/refresh`.
- Jika refresh gagal, session dibersihkan dan user diarahkan ke `/login`.

## Route Utama

Public:

- `/`
- `/login`
- `/create-account`
- `/forgot-password`

Worker + Admin:

- `/assessment`
- `/assessment/result`
- `/learning-path/:id`
- `/dashboard`
- `/badges`
- `/jobs/search`

Company + Admin:

- `/company/jobs`
- `/talent`

Fallback:

- `/not-found`

## Catatan Penting

- Mode mock/dummy **sudah tidak dipakai** untuk alur utama aplikasi.
- Jika server belum aktif atau kontrak tidak cocok, komponen akan menampilkan state error dari request.
- Penamaan service aktif:
  - `src/services/authApiService.ts`
  - `src/services/careerApiService.ts`

## Struktur Folder

```text
src/
  assets/
  components/
  hooks/
  layouts/
  pages/
  routes/
  services/
  store/
  types/
  utils/
```

## Performance

- Hero image di landing memakai `fetchpriority="high"` untuk konten above-the-fold.
- Asset bawah fold di-observe menggunakan `lozad` (`src/hooks/useLozad.ts`).
- Route-level code splitting via `React.lazy` + `Suspense` di `src/routes/AppRoutes.tsx`.
