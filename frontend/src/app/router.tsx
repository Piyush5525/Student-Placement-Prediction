import { createBrowserRouter, Navigate } from "react-router-dom";
import { MarketingLayout } from "@/layouts/marketing-layout";
import { AppShell } from "@/layouts/app-shell";
import { ProtectedRoute, PublicOnlyRoute } from "@/app/routes/protected-route";
import { RouteStub } from "@/app/routes/route-stub";
import { LandingPage } from "@/pages/landing/landing-page";
import { DashboardPage } from "@/pages/app/dashboard-page";
import { OnboardingPage } from "@/pages/app/onboarding-page";
import { PredictionPage } from "@/pages/app/prediction-page";
import { AnalyticsPage } from "@/pages/app/analytics-page";
import { RecommendationsPage } from "@/pages/app/recommendations-page";
import { ProfilePage } from "@/pages/app/profile-page";
import { LoginPage } from "@/pages/auth/login-page";
import { SignupPage } from "@/pages/auth/signup-page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password-page";
import { GoogleCallbackPage } from "@/pages/auth/google-callback-page";
import { GitHubCallbackPage } from "@/pages/app/github-callback-page";
import { ResumePage } from "@/pages/app/resume-page";
import { InterviewPage } from "@/pages/app/interview-page";
import { LeaderboardPage } from "@/pages/app/leaderboard-page";
import { SettingsPage } from "@/pages/app/settings-page";

/**
 * Route tree — mirrors FRONTEND_ARCHITECTURE §5. All public pages, all
 * /app/* pages, and the auth pages are implemented; only /onboarding
 * (first-run profile setup, not part of this build's page list) and the
 * catch-all 404 still render <RouteStub> — see route-stub.tsx.
 *
 * /app/salary, /app/companies, /app/skills redirect to /app/recommendations
 * — that page already covers company matches and skill-gap content, so
 * these three don't warrant separate standalone pages.
 */
export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      // Ungated (neither PublicOnlyRoute nor ProtectedRoute): this callback
      // serves BOTH a fresh Google login (unauthenticated visitor) and
      // linking Google to an already-authenticated user from Settings —
      // gating it under PublicOnlyRoute would redirect a logged-in user
      // away before the code-exchange effect ever ran, silently no-oping
      // the "Connect" button in Settings. GoogleCallbackPage itself checks
      // isAuthenticated to decide where to navigate afterward.
      { path: "auth/google/callback", element: <GoogleCallbackPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "onboarding", element: <OnboardingPage /> },
      { path: "app/settings/github/callback", element: <GitHubCallbackPage /> },
      {
        path: "app",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "prediction", element: <PredictionPage /> },
          { path: "salary", element: <Navigate to="/app/recommendations" replace /> },
          { path: "companies", element: <Navigate to="/app/recommendations" replace /> },
          { path: "skills", element: <Navigate to="/app/recommendations" replace /> },
          { path: "resume", element: <ResumePage /> },
          { path: "interview", element: <InterviewPage /> },
          { path: "leaderboard", element: <LeaderboardPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "recommendations", element: <RecommendationsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <RouteStub label="404 Not Found" />,
  },
]);
