import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Gates /app/* behind authentication, preserving the intended destination
 * for post-login redirect. Also gates first-time students behind
 * /onboarding until they've submitted the 11 ML parameters the placement
 * model needs — `onboardingComplete` flips to true server-side once
 * POST /onboarding succeeds (see backend/app/services/onboarding_service.py).
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useAuthStore((s) => s.user?.onboardingComplete);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (onboardingComplete === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

/** Gates /login /signup /forgot-password — an already-authenticated visitor is bounced to the dashboard. */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
