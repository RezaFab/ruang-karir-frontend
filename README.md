# Ruang Karir Frontend

Frontend aplikasi **Ruang Karir** berbasis React + TypeScript dengan mode 

Live URL : https://ruang-karir-frontend.vercel.app/

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- TanStack Query
- Zustand
- lozad.js
- Priority Hints (`fetchpriority`)

## Performance

- Hero image di landing memakai `fetchpriority="high"` untuk konten above-the-fold.
- Asset bawah fold di-observe menggunakan `lozad` (`src/hooks/useLozad.ts`).
- Route-level code splitting via `React.lazy` + `Suspense` di `src/routes/AppRoutes.tsx`.
