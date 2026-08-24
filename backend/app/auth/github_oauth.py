"""Real GitHub OAuth2 Authorization Code flow — account linking, not login.

Contract: identical shape to app/auth/google_oauth.py (SPA sends the
authorization `code` it received from GitHub's consent redirect; the code
exchange, which needs GITHUB_CLIENT_SECRET, happens server-side so the
secret never reaches the browser). The one structural difference from
Google: this flow's caller is always an already-authenticated user linking
an account from Settings, not someone logging in — see
app/services/github_service.py, which requires get_current_user before
ever touching this module.

If GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are not configured, every
function here raises GitHubOAuthNotConfigured so the route can return a
clean 503 instead of crashing.
"""
from __future__ import annotations

from typing import Any, Dict

import httpx

from config import settings

GITHUB_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token"
GITHUB_API_BASE = "https://api.github.com"


class GitHubOAuthNotConfigured(Exception):
    """Raised when GITHUB_CLIENT_ID/SECRET are missing from the environment."""


class GitHubOAuthError(Exception):
    """Raised when GitHub rejects the code exchange or an API call fails."""


def _require_configured() -> None:
    if not settings.github_oauth_configured:
        raise GitHubOAuthNotConfigured(
            "GitHub integration is not configured on this server — "
            "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are unset."
        )


async def exchange_code_for_token(auth_code: str) -> str:
    """Exchange an authorization `code` for a GitHub access token via the
    standard OAuth2 token endpoint. Raises GitHubOAuthError on failure or
    if GitHub's response doesn't include an access_token (e.g. an
    already-used or expired code)."""
    _require_configured()

    data = {
        "client_id": settings.github_client_id,
        "client_secret": settings.github_client_secret,
        "code": auth_code,
        "redirect_uri": settings.github_redirect_uri,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            GITHUB_TOKEN_ENDPOINT,
            data=data,
            headers={"Accept": "application/json"},
        )

    if response.status_code != 200:
        raise GitHubOAuthError(
            f"GitHub token exchange failed ({response.status_code}): {response.text}"
        )

    body = response.json()
    if "error" in body:
        raise GitHubOAuthError(
            f"GitHub rejected the code: {body.get('error_description', body['error'])}"
        )

    access_token = body.get("access_token")
    if not access_token:
        raise GitHubOAuthError("GitHub token response did not include an access_token.")

    return access_token


async def fetch_authenticated_user(access_token: str) -> Dict[str, Any]:
    """GET /user — the linked GitHub profile itself (login, avatar_url,
    public_repos, followers, following, html_url, id, ...)."""
    return await _get(access_token, "/user")


async def fetch_user_repos(access_token: str, per_page: int = 100) -> list:
    """GET /user/repos — every repo the token's owner can see, including
    private ones IF the 'repo' scope were requested (it isn't — see
    github-oauth.ts's scope list, which deliberately requests only
    'read:user' + 'public_repo' so only public data is ever pulled),
    sorted by most-recently pushed first."""
    return await _get(
        access_token,
        "/user/repos",
        params={"per_page": per_page, "sort": "pushed", "direction": "desc", "type": "public"},
    )


async def fetch_user_events(access_token: str, username: str, per_page: int = 100) -> list:
    """GET /users/{username}/events/public — recent public activity
    (pushes, PRs, issues, ...), used to derive a "recent activity" signal."""
    return await _get(access_token, f"/users/{username}/events/public", params={"per_page": per_page})


async def _get(access_token: str, path: str, params: Dict[str, Any] | None = None) -> Any:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{GITHUB_API_BASE}{path}",
            params=params,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )

    if response.status_code != 200:
        raise GitHubOAuthError(
            f"GitHub API request to {path} failed ({response.status_code}): {response.text}"
        )

    return response.json()
