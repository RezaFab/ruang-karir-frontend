import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingSkeleton } from '../components'
import { AppLayout, PublicLayout } from '../layouts'
import { ProtectedRoute, PublicOnlyRoute } from './RouteGuards'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const CreateAccountPage = lazy(() => import('../pages/CreateAccountPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const AssessmentPage = lazy(() => import('../pages/AssessmentPage'))
const AssessmentResultPage = lazy(() => import('../pages/AssessmentResultPage'))
const LearningPathDetailPage = lazy(() => import('../pages/LearningPathDetailPage'))
const ProgressDashboardPage = lazy(() => import('../pages/ProgressDashboardPage'))
const BadgesPage = lazy(() => import('../pages/BadgesPage'))
const CompanyViewPage = lazy(() => import('../pages/CompanyViewPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <LoadingSkeleton lines={5} />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/assessment/result" element={<AssessmentResultPage />} />
            <Route path="/learning-path/:id" element={<LearningPathDetailPage />} />
            <Route path="/dashboard" element={<ProgressDashboardPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/company" element={<CompanyViewPage />} />
          </Route>
        </Route>

        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  )
}
