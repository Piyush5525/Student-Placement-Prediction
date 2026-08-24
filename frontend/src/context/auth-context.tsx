import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import * as authService from "@/services/auth-service";
import type { BackendUser, TokenResponse } from "@/services/auth-service";
import { getApiErrorMessage } from "@/lib/api-client";

/**
 * camelCase vs snake_case decision: the backend speaks snake_case
 * everywhere (Pydantic convention). The pre-existing `useAuthStore`
 * (src/stores/auth-store.ts) already speaks camelCase for its `AuthUser`
 * shape (`onboardingComplete`) — that store's public API is explicitly
 * off-limits to redesign (9 other files depend on it as-is). So the
 * translation boundary is exactly here, in AuthProvider: services/
 * auth-service.ts returns raw snake_case backend shapes, and this file
 * converts to the store's camelCase AuthUser before calling setSession.
 * Every other new hook (src/hooks/*) follows the same rule: fetch snake_case
 * from the service layer, hand it to pages as-is (pages already reference
 * fields like `cgpa`, `college_tier` is the one exception — see hooks
 * themselves for any per-field notes), documented at each hook.
 */
function toAuthUser(user: BackendUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboardingComplete: user.onboarding_complete,
    googleLinked: user.google_linked,
    googleEmail: user.google_email,
    googlePicture: user.google_picture,
    hasPassword: user.has_password,
  };
}

interface AuthContextValue {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (code: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetches GET /auth/me and updates the store — call after any action that changes provider-link state (e.g. disconnecting Google). */
  refreshUser: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  /** True while the mount-time GET /auth/me validation of a stored token is in flight. */
  isValidating: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function applySession(response: TokenResponse, rememberMe: boolean) {
  useAuthStore
    .getState()
    .setSession(response.access_token, toAuthUser(response.user), response.refresh_token, rememberMe);
}

/**
 * AuthProvider — owns the real backend auth calls and drives the existing
 * Zustand auth-store's setSession/clearSession. On mount, if a token is
 * already present (e.g. from a previous session persisted to
 * localStorage), it validates that token against GET /auth/me: a stale or
 * expired token would otherwise still read as isAuthenticated: true and
 * let ProtectedRoute through, only to have every real API call 401. If
 * validation fails, the session is cleared so the user is correctly
 * bounced to /login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const { token, clearSession, updateUser } = useAuthStore.getState();
    if (!token) {
      setIsValidating(false);
      return;
    }
    authService
      .me()
      .then((freshUser) => {
        // Refresh the cached user object too, not just check success — a
        // provider link (Google/GitHub) or profile picture may have
        // changed since this token was issued, and without this the
        // Settings page would show stale connected-state data until the
        // user re-logged-in.
        updateUser(toAuthUser(freshUser));
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setIsValidating(false));
    // Intentionally run once on mount only — this is a one-time boot check,
    // not a subscription to token changes (login/signup already set a
    // freshly-issued, known-good token, so re-validating right after would
    // be redundant).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string, rememberMe = false) {
    const response = await authService.login({ email, password });
    applySession(response, rememberMe);
  }

  async function signup(name: string, email: string, password: string, rememberMe = false) {
    const response = await authService.signup({ name, email, password });
    applySession(response, rememberMe);
  }

  async function loginWithGoogle(code: string, rememberMe = false) {
    const response = await authService.loginWithGoogle(code);
    applySession(response, rememberMe);
  }

  async function logout() {
    const refreshToken = useAuthStore.getState().refreshToken;
    try {
      await authService.logout(refreshToken);
    } catch {
      // Logout is best-effort server-side (it just revokes the refresh
      // token) — even if this call fails (network blip, already-revoked
      // token), we still clear the local session below so the UI reflects
      // "signed out" immediately.
    } finally {
      useAuthStore.getState().clearSession();
    }
  }

  async function refreshUser() {
    const freshUser = await authService.me();
    useAuthStore.getState().updateUser(toAuthUser(freshUser));
  }

  async function disconnectGoogle() {
    const freshUser = await authService.disconnectGoogle();
    useAuthStore.getState().updateUser(toAuthUser(freshUser));
  }

  return (
    <AuthContext.Provider
      value={{ login, signup, loginWithGoogle, logout, refreshUser, disconnectGoogle, isValidating }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { getApiErrorMessage };
