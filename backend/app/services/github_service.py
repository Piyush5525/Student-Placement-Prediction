"""Orchestrates the GitHub account-linking flow: exchange code -> fetch
profile/repos/events -> derive analytics -> store. Routes stay thin and
call only into this module, per the project's routes/services split.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.auth.github_oauth import (
    GitHubOAuthError,
    GitHubOAuthNotConfigured,
    exchange_code_for_token,
    fetch_authenticated_user,
    fetch_user_events,
    fetch_user_repos,
)
from app.models.store import GitHubAccount, store
from app.schemas.github import GitHubAccountOut, GitHubNotConnectedOut
from app.services.github_analytics import (
    compute_developer_score,
    compute_top_languages,
    count_recent_activity,
    summarize_recent_repos,
)


def _account_out(account: GitHubAccount) -> GitHubAccountOut:
    return GitHubAccountOut(
        username=account.username,
        avatar_url=account.avatar_url,
        profile_url=account.profile_url,
        public_repos_count=account.public_repos_count,
        followers_count=account.followers_count,
        following_count=account.following_count,
        top_languages=[
            {"language": l.language, "bytes": l.bytes, "percentage": l.percentage}
            for l in account.top_languages
        ],
        recent_repos=[
            {
                "name": r.name,
                "description": r.description,
                "language": r.language,
                "stargazers_count": r.stargazers_count,
                "forks_count": r.forks_count,
                "updated_at": r.updated_at,
                "html_url": r.html_url,
            }
            for r in account.recent_repos
        ],
        recent_activity_count=account.recent_activity_count,
        developer_score=account.developer_score,
        developer_score_breakdown=account.developer_score_breakdown,
        connected_at=account.connected_at.isoformat(),
        last_synced_at=account.last_synced_at.isoformat(),
    )


async def connect_github(user_id: str, auth_code: str) -> GitHubAccountOut:
    """Full link flow: exchange the authorization code, pull the profile +
    public repos + recent public events, derive analytics, persist, and
    return the same shape GET /integrations/github returns."""
    try:
        access_token = await exchange_code_for_token(auth_code)
    except GitHubOAuthNotConfigured as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "GitHub integration is not configured on this server yet. "
                "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env."
            ),
        ) from exc
    except GitHubOAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"GitHub connection failed: {exc}",
        ) from exc

    account = await _sync(user_id, access_token)
    return _account_out(account)


async def _sync(user_id: str, access_token: str) -> GitHubAccount:
    try:
        profile = await fetch_authenticated_user(access_token)
        repos = await fetch_user_repos(access_token)
        events = await fetch_user_events(access_token, profile["login"])
    except GitHubOAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Couldn't fetch data from GitHub: {exc}",
        ) from exc

    top_languages = compute_top_languages(repos)
    recent_repos = summarize_recent_repos(repos)
    recent_activity_count = count_recent_activity(events)
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)

    developer_score, breakdown = compute_developer_score(
        public_repos_count=profile.get("public_repos", 0),
        total_stars=total_stars,
        language_count=len(top_languages),
        recent_activity_count=recent_activity_count,
        followers_count=profile.get("followers", 0),
    )

    now = datetime.now(timezone.utc)
    existing = store.get_github_account(user_id)

    account = GitHubAccount(
        user_id=user_id,
        github_user_id=profile["id"],
        username=profile["login"],
        avatar_url=profile.get("avatar_url"),
        profile_url=profile.get("html_url", f"https://github.com/{profile['login']}"),
        access_token=access_token,
        connected_at=existing.connected_at if existing else now,
        last_synced_at=now,
        public_repos_count=profile.get("public_repos", 0),
        followers_count=profile.get("followers", 0),
        following_count=profile.get("following", 0),
        top_languages=top_languages,
        recent_repos=recent_repos,
        recent_activity_count=recent_activity_count,
        developer_score=developer_score,
        developer_score_breakdown=breakdown,
    )
    store.set_github_account(account)
    return account


def get_github_account(user_id: str):
    account = store.get_github_account(user_id)
    if account is None:
        return GitHubNotConnectedOut()
    return _account_out(account)


async def resync_github(user_id: str) -> GitHubAccountOut:
    """Re-fetch fresh data using the already-stored access token — no new
    OAuth round-trip needed, matches requirement #4's "recent activity"
    actually staying current if the user asks for a refresh."""
    account = store.get_github_account(user_id)
    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No GitHub account is connected.",
        )
    refreshed = await _sync(user_id, account.access_token)
    return _account_out(refreshed)


def disconnect_github(user_id: str) -> None:
    store.delete_github_account(user_id)
