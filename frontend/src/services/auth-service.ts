import { apiClient } from "@/lib/api-client";

/**
 * Types mirror the backend's snake_case Pydantic schemas exactly (see
 * backend/app/schemas/auth.py). We keep snake_case at this service-layer
 * boundary and only translate to the app's camelCase `AuthUser` shape
 * (src/stores/auth-store.ts) inside auth-context.tsx — see that file's
 * top comment for the full camelCase-vs-snake_case rationale.
 */
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  onboarding_complete: boolean;
  auth_provider: string;
  google_linked: boolean;
  google_email: string | null;
  google_picture: string | null;
  has_password: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: BackendUser;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function signup(payload: SignupPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/signup", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", payload);
  return data;
}

/**
 * Google OAuth code exchange. Currently always 503s in this environment
 * because no Google Cloud credentials are configured server-side — that is
 * expected. Callers must catch and surface the 503 rather than treating it
 * as a crash.
 */
export async function loginWithGoogle(code: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/google", { code });
  return data;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", { refresh_token: refreshToken });
  return data;
}

export async function logout(refreshToken: string | null): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/logout", { refresh_token: refreshToken });
  return data;
}

export async function me(): Promise<BackendUser> {
  const { data } = await apiClient.get<BackendUser>("/auth/me");
  return data;
}

export async function disconnectGoogle(): Promise<BackendUser> {
  const { data } = await apiClient.delete<BackendUser>("/auth/google");
  return data;
}
