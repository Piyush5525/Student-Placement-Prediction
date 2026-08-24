from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel


class GitHubConnectRequest(BaseModel):
    code: str


class GitHubLanguageOut(BaseModel):
    language: str
    bytes: int
    percentage: float


class GitHubRepoOut(BaseModel):
    name: str
    description: Optional[str]
    language: Optional[str]
    stargazers_count: int
    forks_count: int
    updated_at: str
    html_url: str


class GitHubAccountOut(BaseModel):
    """Everything requirement #4 asks the UI to display, plus the
    requirement #6 developer-score analytics, plus the raw counts a future
    ML feature-extraction step (requirement #8) would want without having
    to re-derive them from `recent_repos`."""

    connected: bool = True
    username: str
    avatar_url: Optional[str]
    profile_url: str
    public_repos_count: int
    followers_count: int
    following_count: int
    top_languages: List[GitHubLanguageOut]
    recent_repos: List[GitHubRepoOut]
    recent_activity_count: int
    developer_score: int
    developer_score_breakdown: Dict[str, int]
    connected_at: str
    last_synced_at: str


class GitHubNotConnectedOut(BaseModel):
    connected: bool = False
