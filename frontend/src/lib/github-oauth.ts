const GITHUB_AUTH_ENDPOINT = "https://github.com/login/oauth/authorize";

/**
 * Redirects the browser to GitHub's real consent screen (Authorization
 * Code flow) to LINK a GitHub account to the already-logged-in student —
 * this is never a login method, unlike redirectToGoogleConsent(). GitHub
 * redirects back to VITE_GITHUB_REDIRECT_URI with a `?code=...` query
 * param once approved; GitHubCallbackPage hands that code to
 * POST /integrations/github/connect, where the backend exchanges it
 * server-side (client secret never touches the browser — see
 * backend/app/auth/github_oauth.py).
 *
 * Scope is deliberately read-only and public-data-only: `read:user` for
 * profile fields, `public_repo` for repo listing. No `repo` scope (which
 * would grant private-repo access) — the analytics panel only ever shows
 * public activity.
 */
export function redirectToGitHubConsent(): void {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user public_repo",
    allow_signup: "false",
  });

  window.location.href = `${GITHUB_AUTH_ENDPOINT}?${params.toString()}`;
}
