import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

/**
 * Minimal auth state so the routing foundation (protected /app/* routes,
 * public-only /login /signup) can function before the real auth pages and
 * backend integration exist. `token`/`user` shape intentionally kept loose
 * — FRONTEND_ARCHITECTURE §1 assumes JWT-based auth against the FastAPI
 * backend but doesn't specify a payload shape, and this is foundation
 * scaffolding, not the auth implementation itself.
 */
interface AuthUser {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  /** Whether Google is linked as a sign-in method for this account — independent of how the account was originally created. */
  googleLinked: boolean;
  googleEmail: string | null;
  googlePicture: string | null;
  hasPassword: boolean;
}

interface AuthState {
  token: string | null;
  /**
   * Refresh token from the backend's TokenResponse. Added alongside the
   * real backend integration (src/services/auth-service.ts) so the Axios
   * response interceptor (src/lib/api-client.ts) can silently refresh an
   * expired access token via POST /auth/refresh. Persisted the same way as
   * `token` — same storage key, same persist middleware.
   */
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** "Remember me" — whether the current session survives a browser restart. See REMEMBER_ME_KEY below. */
  rememberMe: boolean;
  setSession: (token: string, user: AuthUser, refreshToken?: string | null, rememberMe?: boolean) => void;
  /** Updates just the user object (e.g. after GET /auth/me picks up a provider-link change) without touching tokens/isAuthenticated. */
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
}

/**
 * "Remember me" implementation: zustand's `persist` picks one storage
 * backend at store-creation time, so switching between localStorage
 * (survives closing the browser) and sessionStorage (cleared when the tab/
 * browser closes) per-login needs a storage adapter that decides at
 * read/write time rather than at store-creation time.
 *
 * The decision itself (`rememberMe`) is a plain boolean kept in
 * localStorage under its own key — it has to live somewhere that survives
 * a browser restart even when the user did NOT check "remember me", so
 * that on next launch we know to look in sessionStorage (find nothing,
 * since a fresh browser session cleared it) rather than defaulting back to
 * localStorage and resurrecting stale session data.
 */
const REMEMBER_ME_KEY = "placement-prediction-remember-me";

function activeStorage(): Storage {
  const remembered = window.localStorage.getItem(REMEMBER_ME_KEY) === "true";
  return remembered ? window.localStorage : window.sessionStorage;
}

const rememberAwareStorage: StateStorage = {
  getItem: (name) => activeStorage().getItem(name),
  setItem: (name, value) => activeStorage().setItem(name, value),
  removeItem: (name) => {
    // Clear from both — avoids a stale copy lingering in the storage we're
    // no longer using after a rememberMe flip (e.g. logging out).
    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      rememberMe: false,
      setSession: (token, user, refreshToken = null, rememberMe = false) => {
        window.localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
        set({ token, user, refreshToken, isAuthenticated: true, rememberMe });
      },
      updateUser: (user) => set({ user }),
      clearSession: () => {
        // Order matters here: `set()` below triggers persist's `setItem`,
        // which asks `activeStorage()` where to write — and that reads
        // REMEMBER_ME_KEY at call time. Removing the flag BEFORE `set()`
        // meant the cleared state got written to sessionStorage while the
        // still-authenticated state sat untouched in localStorage (or vice
        // versa), leaving the user silently still logged in after
        // "logging out." Wiping the persisted auth key directly from BOTH
        // storages up front sidesteps the ordering trap entirely — nothing
        // is left for the subsequent `set()` write to race against.
        window.localStorage.removeItem("placement-prediction-auth");
        window.sessionStorage.removeItem("placement-prediction-auth");
        window.localStorage.removeItem(REMEMBER_ME_KEY);
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false, rememberMe: false });
      },
    }),
    { name: "placement-prediction-auth", storage: createJSONStorage(() => rememberAwareStorage) },
  ),
);
