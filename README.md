# Ruang Karir Frontend Prototype

Frontend prototype backend-ready untuk demo/pitch aplikasi **Ruang Karir**.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Zustand
- lozad.js
- Priority Hints (`fetchPriority`)

## Menjalankan Project

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Route Utama

- `/` Landing Page
- `/assessment` Assessment multi-step
- `/assessment/result` Assessment Result (2 jalur)
- `/learning-path/:id` Detail learning path
- `/dashboard` Progress dashboard
- `/badges` Badge / achievement
- `/company` Optional company / HR view
- `/not-found` Not found page

## Struktur Folder

```text
src/
  assets/
  components/
    cards/
    common/
  hooks/
  layouts/
  mocks/
  pages/
  routes/
  services/
  store/
  types/
  utils/
```

## Data Layer (Backend-ready)

Semua data dummy tidak ditaruh di komponen UI, tetapi lewat service API:

- Contract endpoint: `src/services/contracts.ts`
- Interface service: `src/services/apiService.ts`
- Mock implementation: `src/services/mockCareerApiService.ts`
- Real API implementation (placeholder): `src/services/realCareerApiService.ts`
- Service selector: `src/services/index.ts`
- Query key factory: `src/services/queryKeys.ts`

### Endpoint contract yang disiapkan

- `GET /api/career-goals`
- `POST /api/assessments`
- `POST /api/recommendations`
- `GET /api/learning-paths/:id`
- `PATCH /api/learning-paths/:id/progress`
- `GET /api/badges`
- `GET /api/industry-trends`
- `GET /api/company/candidates`

## Query & Mutation (TanStack Query)

Contoh hook ada di `src/hooks/useCareerApi.ts`:

- Query: profile, career goals, trends, badges, candidates, learning path, progress summary
- Mutation: submit assessment, request recommendation, update module progress

## Global State (Zustand)

- `src/store/useSessionStore.ts` -> auth/session mock + role switch
- `src/store/useAssessmentStore.ts` -> draft assessment + selected career goal
- `src/store/useUiStore.ts` -> filter/sort UI state

## Performance

- **Priority Hints**: Hero image memakai `fetchPriority="high"` di `src/pages/LandingPage.tsx`
- **lozad.js**: Lazy image bawah fold via class `.lozad` dan `data-src`
  - Hook observer: `src/hooks/useLozad.ts`
  - Aktivasi per route: `src/App.tsx`

## Migrasi Mock API ke Backend Asli

1. Implementasi real request sudah disiapkan di `src/services/realCareerApiService.ts`.
2. Set env berikut agar aplikasi pakai real API:

```bash
VITE_USE_MOCK_API=false
```

3. Pastikan response backend mengikuti shape `ApiResponse<T>` di `src/types/api.ts`.
4. Jika endpoint real berbeda, update mapping di `src/services/contracts.ts`.
5. Komponen halaman tidak perlu diubah karena konsumsi data sudah lewat hooks/query.
