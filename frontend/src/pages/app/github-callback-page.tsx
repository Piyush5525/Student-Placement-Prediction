import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGitHubIntegration } from "@/hooks/use-github-integration";
import { getApiErrorMessage } from "@/lib/api-client";

/**
 * Landing target for GitHub's OAuth redirect (VITE_GITHUB_REDIRECT_URI /
 * backend's GITHUB_REDIRECT_URI must both point here, and it must match
 * the GitHub OAuth App's Authorization callback URL exactly). GitHub
 * appends `?code=...` on success or `?error=...` if the user cancels.
 * This page's only job: pull the code out of the URL, hand it to
 * POST /integrations/github/connect via useGitHubIntegration().connect(),
 * then route back to Settings — mirrors GoogleCallbackPage's shape
 * exactly, but lands on /app/settings instead of the dashboard since this
 * is account linking, not login.
 */
export function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { connect } = useGitHubIntegration();
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    // Guards against React 18 StrictMode's double-invoke in dev, which
    // would otherwise send the same one-time authorization code twice —
    // the second exchange fails because GitHub auth codes are single-use.
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get("code");
    const githubError = searchParams.get("error");

    if (githubError) {
      setError(
        githubError === "access_denied"
          ? "GitHub connection was cancelled."
          : `GitHub connection failed: ${githubError}`,
      );
      return;
    }

    if (!code) {
      setError("GitHub did not return an authorization code.");
      return;
    }

    connect(code)
      .then(() => navigate("/app/settings", { replace: true, state: { githubConnected: true } }))
      .catch((err) => {
        setError(getApiErrorMessage(err, "GitHub connection failed."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      {error ? (
        <>
          <p className="max-w-sm text-sm text-danger">{error}</p>
          <Link to="/app/settings" className="text-sm text-accent-ink hover:underline">
            Back to settings
          </Link>
        </>
      ) : (
        <>
          <span className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent text-accent-ink" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Connecting your GitHub account…</p>
        </>
      )}
    </div>
  );
}
