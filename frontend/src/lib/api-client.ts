import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Configured Axios instance for the real FastAPI backend. Base URL comes
 * from VITE_API_BASE_URL (see .env / .env.example).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Backend's consistent error envelope: {"detail": "...", "error_code": "..."}. */
export interface ApiErrorBody {
  detail?: string;
  error_code?: string;
}

/** Extracts a human-readable message from an Axios error against this API, with a sane fallback. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.detail) return body.detail;
    if (error.message) return error.message;
  }
  return fallback;
}

// Request interceptor — attach the current access token, if any.
// Zustand stores are readable outside React components via `.getState()`;
// interceptors run outside the component tree, so this is the correct way
// to read the latest token here rather than a React hook.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — silent-refresh-on-401 with a strict no-infinite-
 * loop guard.
 *
 * The guard has two parts, both necessary:
 *  1. `_retry` flag stamped onto the original request config the first
 *     time we retry it. If a *retried* request still comes back 401 (i.e.
 *     the refreshed token is somehow still rejected), we do NOT try to
 *     refresh again — we give up and clear the session. Without this, a
 *     persistently-401ing endpoint would refresh forever.
 *  2. Explicit URL exclusion for `/auth/refresh` and `/auth/login` (and
 *     `/auth/signup`/`/auth/google` for the same reason). If the refresh
 *     call itself returns 401 (refresh token expired/revoked), retrying
 *     THAT call through this same interceptor would immediately 401 again
 *     and recurse forever. Login/signup/google 401s are just "wrong
 *     credentials" and must never trigger a refresh attempt either.
 */
let refreshPromise: Promise<string> | null = null;

const NO_REFRESH_PATHS = ["/auth/refresh", "/auth/login", "/auth/signup", "/auth/google"];

function isNoRefreshUrl(url?: string): boolean {
  if (!url) return false;
  return NO_REFRESH_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isNoRefreshUrl(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const { refreshToken, clearSession, setSession, user } = useAuthStore.getState();

    if (!refreshToken) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // De-dupe concurrent 401s: only one refresh call in flight at a time,
      // every other pending 401'd request awaits the same promise.
      if (!refreshPromise) {
        refreshPromise = axios
          .post<{ access_token: string; token_type: string }>(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
          )
          .then((res) => res.data.access_token)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      // Update the store with the new access token, keeping the same user
      // and refresh token (the backend doesn't rotate the refresh token on
      // a plain /auth/refresh call).
      if (user) setSession(newAccessToken, user, refreshToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

/**
 * Full page redirect to /login. This runs inside an Axios interceptor,
 * outside React Router context, so there's no `navigate()` available here
 * — `window.location.href` is the straightforward, dependency-free choice.
 * It causes a full reload (losing in-memory state), which is acceptable
 * for a "your session expired" bounce.
 */
function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}
