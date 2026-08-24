import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useAuthStore } from "@/stores/auth-store";
import { getApiErrorMessage } from "@/lib/api-client";

/**
 * Landing target for Google's OAuth redirect (VITE_GOOGLE_REDIRECT_URI /
 * backend's GOOGLE_REDIRECT_URI must both point here). Google appends
 * `?code=...` on success or `?error=...` if the user cancels/denies
 * consent. This page's only job: pull that code out of the URL, hand it to
 * POST /auth/google via the existing loginWithGoogle() context method, and
 * route onward — no UI of its own beyond a brief loading/error state,
 * since the user only sees this for a moment mid-redirect.
 *
 * Serves TWO flows through the same route (see router.tsx — this route is
 * deliberately ungated by PublicOnlyRoute so both work):
 *   1. Fresh login (visitor arrives unauthenticated) → routes to dashboard.
 *   2. Linking Google to an already-logged-in user from Settings' Connect
 *      button → the backend's login_with_google() finds-or-links by email
 *      regardless of caller intent, so no separate endpoint is needed; this
 *      page just needs to route back to Settings and refresh the cached
 *      user object instead of treating it as a new login.
 */
export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle, refreshUser } = useAuth();
  const wasAlreadyAuthenticated = useRef(useAuthStore.getState().isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    // Guards against React 18 StrictMode's double-invoke in dev, which
    // would otherwise send the same one-time authorization code to the
    // backend twice — the second exchange fails because Google auth codes
    // are single-use.
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get("code");
    const googleError = searchParams.get("error");

    if (googleError) {
      setError(
        googleError === "access_denied"
          ? "Google sign-in was cancelled."
          : `Google sign-in failed: ${googleError}`,
      );
      return;
    }

    if (!code) {
      setError("Google did not return an authorization code.");
      return;
    }

    if (wasAlreadyAuthenticated.current) {
      // Linking flow: the user clicked "Connect" for Google from Settings
      // while already logged in (password or otherwise). loginWithGoogle
      // still runs the same exchange — the backend links google_sub to the
      // CURRENT user by matching email, it doesn't create a second account
      // — then refreshUser() pulls the now-updated google_linked/
      // google_picture fields into the store before returning to Settings.
      loginWithGoogle(code, true)
        .then(() => refreshUser())
        .then(() => navigate("/app/settings", { replace: true }))
        .catch((err) => {
          setError(getApiErrorMessage(err, "Google connection failed."));
        });
      return;
    }

    const rememberMe = window.sessionStorage.getItem("placement-prediction-remember-me-intent") === "true";
    window.sessionStorage.removeItem("placement-prediction-remember-me-intent");

    loginWithGoogle(code, rememberMe)
      .then(() => navigate("/app/dashboard", { replace: true }))
      .catch((err) => {
        setError(getApiErrorMessage(err, "Google sign-in failed."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      {error ? (
        <>
          <p className="max-w-sm text-sm text-danger">{error}</p>
          <Link to="/login" className="text-sm text-accent-ink hover:underline">
            Back to log in
          </Link>
        </>
      ) : (
        <>
          <span className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent text-accent-ink" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Signing you in with Google…</p>
        </>
      )}
    </div>
  );
}
