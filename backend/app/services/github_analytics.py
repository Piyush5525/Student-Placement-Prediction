"""Pure functions deriving analytics from raw GitHub API data — requirement
#6 ("GitHub analytics panel that analyzes repositories and calculates a
developer score"). Kept separate from github_service.py's fetch/sync
orchestration so the scoring logic is independently testable and, per
requirement #8, easy to hand to an ML feature-extraction step later without
dragging in any HTTP/OAuth code.
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Tuple

from app.models.store import GitHubLanguageStat, GitHubRepoSummary

# Score weights sum to 100 — each component capped independently so no
# single dimension (e.g. a lucky viral repo's stars) can dominate the
# score; a well-rounded profile scores higher than a one-hit-wonder.
_MAX_REPO_POINTS = 30
_MAX_STAR_POINTS = 25
_MAX_LANGUAGE_DIVERSITY_POINTS = 15
_MAX_ACTIVITY_POINTS = 20
_MAX_FOLLOWER_POINTS = 10


def compute_top_languages(repos: List[Dict[str, Any]]) -> List[GitHubLanguageStat]:
    """GitHub's repo-list API only returns each repo's single primary
    language (not a byte breakdown) without an extra per-repo API call per
    repo — fetching the real per-language byte split would mean N+1
    requests against /repos/{owner}/{repo}/languages. Approximating each
    repo's primary language as "100% of that repo" and aggregating by repo
    COUNT (not true byte count) is deliberately a simplification: it
    answers "what does this student mostly write in" correctly for the UI
    without the extra API load. Documented here so it's not silently
    presented as byte-accurate.
    """
    counts = Counter(repo["language"] for repo in repos if repo.get("language"))
    total = sum(counts.values())
    if total == 0:
        return []

    stats = [
        GitHubLanguageStat(language=lang, bytes=count, percentage=round(count / total * 100, 1))
        for lang, count in counts.most_common(8)
    ]
    return stats


def summarize_recent_repos(repos: List[Dict[str, Any]], limit: int = 6) -> List[GitHubRepoSummary]:
    return [
        GitHubRepoSummary(
            name=repo["name"],
            description=repo.get("description"),
            language=repo.get("language"),
            stargazers_count=repo.get("stargazers_count", 0),
            forks_count=repo.get("forks_count", 0),
            updated_at=repo.get("pushed_at") or repo.get("updated_at", ""),
            html_url=repo["html_url"],
        )
        for repo in repos[:limit]
    ]


def count_recent_activity(events: List[Dict[str, Any]], days: int = 90) -> int:
    """Public events (pushes, PRs, issues, etc.) within the last `days`."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    count = 0
    for event in events:
        created_at = event.get("created_at")
        if not created_at:
            continue
        try:
            event_time = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except ValueError:
            continue
        if event_time >= cutoff:
            count += 1
    return count


def compute_developer_score(
    *,
    public_repos_count: int,
    total_stars: int,
    language_count: int,
    recent_activity_count: int,
    followers_count: int,
) -> Tuple[int, Dict[str, int]]:
    """A transparent, explainable 0-100 score — every component is a
    capped linear scale, not a black box, so the UI can show the
    breakdown (requirement #6's "analytics panel", not just a bare
    number). This is a heuristic for user-facing signal only; it is
    explicitly NOT the placement-prediction ML model (out of scope per
    the task's constraints) and must not be confused with one.
    """
    repo_points = min(_MAX_REPO_POINTS, round(public_repos_count * 2))
    star_points = min(_MAX_STAR_POINTS, round(total_stars * 1.5))
    language_points = min(_MAX_LANGUAGE_DIVERSITY_POINTS, language_count * 3)
    activity_points = min(_MAX_ACTIVITY_POINTS, round(recent_activity_count * 0.8))
    follower_points = min(_MAX_FOLLOWER_POINTS, round(followers_count * 0.5))

    breakdown = {
        "repositories": repo_points,
        "stars": star_points,
        "language_diversity": language_points,
        "recent_activity": activity_points,
        "community": follower_points,
    }
    total = sum(breakdown.values())
    return total, breakdown
