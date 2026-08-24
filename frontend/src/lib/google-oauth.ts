const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

/**
 * Redirects the browser to Google's real consent screen (Authorization
 * Code flow). Google will redirect back to VITE_GOOGLE_REDIRECT_URI with a
 * `?code=...` query param once the user approves — that page
 * (GoogleCallbackPage) hands the code to POST /auth/google, where the
 * backend exchanges it server-side (client secret never touches the
 * browser — see backend/app/auth/google_oauth.py for the full rationale).
 */
export function redirectToGoogleConsent(): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  window.location.href = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}
