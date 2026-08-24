"""In-memory 'database'. Plain Python dataclasses + dicts — no ORM, no SQL.

Everything lives in module-level dicts inside `InMemoryStore`, instantiated
once as a singleton (`store`) and imported by services. Data does not
survive a process restart; that's an explicit, accepted limitation of this
pass (see project spec — "do not implement a real database").
"""
from __future__ import annotations

import itertools
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class User:
    id: str
    email: str
    name: str
    hashed_password: Optional[str]  # None for Google-only accounts
    onboarding_complete: bool = False
    auth_provider: str = "password"  # "password" | "google" — how the account was FIRST created
    google_sub: Optional[str] = None
    google_email: Optional[str] = None
    google_picture: Optional[str] = None
    created_at: datetime = field(default_factory=utcnow)

    @property
    def google_linked(self) -> bool:
        """Whether Google is linked as a sign-in method, independent of
        `auth_provider` — a password-first account can later link Google
        (see auth_service.login_with_google's merge-by-email path), and
        that link should show as "Connected" in Settings even though
        `auth_provider` stays "password" (it records original signup
        method, not current linked providers)."""
        return self.google_sub is not None


@dataclass
class Profile:
    user_id: str
    name: str
    email: str
    branch: str = "Computer Science"
    college_tier: str = "Tier 2"
    batch_year: int = 2026
    cgpa: float = 8.4
    internships_count: int = 2
    projects_count: int = 5
    certifications_count: int = 3
    coding_skill_score: int = 78
    aptitude_score: int = 71
    communication_skill_score: int = 66
    logical_reasoning_score: int = 74
    hackathons_participated: int = 3
    github_repos: int = 14
    linkedin_connections: int = 312
    mock_interview_score: int = 69
    attendance_percentage: int = 91
    backlogs: int = 0
    extracurricular_score: int = 58
    leadership_score: int = 52
    sleep_hours: float = 6.5
    study_hours_per_day: float = 4.2
    member_since: str = "Jan 2026"

    # --- Placement model inputs (models/metadata.json `feature_order`) ---
    # cgpa and backlogs above are shared with the ML model as-is; everything
    # below exists ONLY to feed the trained model and has no other use in
    # the app. None until the student completes onboarding — the ML feature
    # names differ from this app's existing profile vocabulary (e.g. this
    # is "Major Projects" specifically, not the general `projects_count`),
    # so a new field was necessary rather than reusing an existing one.
    major_projects: Optional[int] = None
    mini_projects: Optional[int] = None
    workshops_certifications: Optional[int] = None
    skills: Optional[int] = None
    communication_skill_rating: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    tenth_percentage: Optional[float] = None
    internship: Optional[str] = None  # "Yes" | "No"
    hackathon: Optional[str] = None  # "Yes" | "No"


@dataclass
class PredictionRecord:
    """One logged run of the real ML model — written by POST /prediction
    and POST /onboarding, read back by GET /prediction/history."""

    id: str
    user_id: str
    prediction: str  # "Placed" | "NotPlaced"
    placement_probability: float
    not_placed_probability: float
    confidence: str
    chance_category: str
    created_at: datetime = field(default_factory=utcnow)


@dataclass
class ResumeRecord:
    id: str
    user_id: str
    filename: str
    size_bytes: int
    content_type: str
    uploaded_at: datetime = field(default_factory=utcnow)


@dataclass
class GitHubLanguageStat:
    """One language's share across a user's public repos, by bytes."""

    language: str
    bytes: int
    percentage: float


@dataclass
class GitHubRepoSummary:
    name: str
    description: Optional[str]
    language: Optional[str]
    stargazers_count: int
    forks_count: int
    updated_at: str
    html_url: str


@dataclass
class GitHubAccount:
    """A linked GitHub profile — separate from `User`/`auth_provider`. A
    student can log in via password or Google and independently link
    GitHub from Settings; linking never changes how they authenticate.

    `access_token` is kept here (server-side only, never sent to the
    frontend) so the backend can re-fetch fresh data later without asking
    the user to reconnect. Everything else is data already fetched from
    GitHub's API and cached — see app/services/github_service.py for the
    fetch/refresh logic and app/services/github_analytics.py for how
    `developer_score`/`top_languages` are derived from `repos`.
    """

    user_id: str
    github_user_id: int
    username: str
    avatar_url: Optional[str]
    profile_url: str
    access_token: str
    connected_at: datetime = field(default_factory=utcnow)
    last_synced_at: datetime = field(default_factory=utcnow)

    # Raw-ish extracted data (see requirement #4: username, avatar, repo
    # count, languages, public project count, recent activity).
    public_repos_count: int = 0
    followers_count: int = 0
    following_count: int = 0
    top_languages: List[GitHubLanguageStat] = field(default_factory=list)
    recent_repos: List[GitHubRepoSummary] = field(default_factory=list)
    recent_activity_count: int = 0  # public events in the last 90 days

    # Derived analytics (requirement #6) — computed once at sync time, not
    # on every read, since it's a pure function of the fields above.
    developer_score: int = 0
    developer_score_breakdown: Dict[str, int] = field(default_factory=dict)


@dataclass
class UserSettings:
    user_id: str
    theme: str = "dark"  # "dark" | "light" | "system"
    reduced_motion_override: bool = False
    density: str = "comfortable"  # "comfortable" | "compact"
    data_sharing_enabled: bool = False
    notifications: Dict[str, bool] = field(
        default_factory=lambda: {
            "new_prediction": True,
            "weekly_digest": True,
            "recommendation_alerts": False,
        }
    )


class InMemoryStore:
    """Singleton holding every in-memory 'table' plus small helpers."""

    def __init__(self) -> None:
        self.users: Dict[str, User] = {}
        self.users_by_email: Dict[str, str] = {}  # email(lower) -> user_id
        self.profiles: Dict[str, Profile] = {}
        self.resumes: Dict[str, ResumeRecord] = {}
        self.settings: Dict[str, UserSettings] = {}
        self.github_accounts: Dict[str, GitHubAccount] = {}  # keyed by user_id
        self.predictions: Dict[str, List[PredictionRecord]] = {}  # user_id -> history, newest last
        # refresh-token blocklist: tokens explicitly logged out before expiry
        self.revoked_refresh_tokens: set = set()
        self._id_counter = itertools.count(1)

        self._seed_demo_user()

    def _seed_demo_user(self) -> None:
        from app.auth.security import hash_password

        demo_id = "user-demo-001"
        self.users[demo_id] = User(
            id=demo_id,
            email="demo@example.com",
            name="Demo Student",
            hashed_password=hash_password("password123"),
            onboarding_complete=True,
            auth_provider="password",
        )
        self.users_by_email["demo@example.com"] = demo_id
        self.profiles[demo_id] = Profile(
            user_id=demo_id,
            name="Demo Student",
            email="demo@example.com",
            # Placement model inputs — pre-filled so the demo account has a
            # completed onboarding and an existing dashboard to show.
            major_projects=2,
            mini_projects=2,
            workshops_certifications=3,
            skills=8,
            communication_skill_rating=4.6,
            twelfth_percentage=82,
            tenth_percentage=85,
            internship="Yes",
            hackathon="Yes",
        )
        self.settings[demo_id] = UserSettings(user_id=demo_id)
        # Prediction history for this profile is seeded from main.py's
        # startup event, once every module has finished importing — doing
        # it here would circularly import app.services.prediction_service
        # (which itself imports this module) before `store` exists.

    def new_id(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:12]}"

    def create_user(
        self,
        email: str,
        name: str,
        hashed_password: Optional[str],
        auth_provider: str = "password",
        google_sub: Optional[str] = None,
        google_email: Optional[str] = None,
        google_picture: Optional[str] = None,
        onboarding_complete: bool = False,
    ) -> User:
        user_id = self.new_id("user")
        user = User(
            id=user_id,
            email=email,
            name=name,
            hashed_password=hashed_password,
            auth_provider=auth_provider,
            google_sub=google_sub,
            google_email=google_email,
            google_picture=google_picture,
            onboarding_complete=onboarding_complete,
        )
        self.users[user_id] = user
        self.users_by_email[email.lower()] = user_id
        self.profiles[user_id] = Profile(user_id=user_id, name=name, email=email)
        self.settings[user_id] = UserSettings(user_id=user_id)
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        user_id = self.users_by_email.get(email.lower())
        return self.users.get(user_id) if user_id else None

    def get_user_by_google_sub(self, google_sub: str) -> Optional[User]:
        for user in self.users.values():
            if user.google_sub == google_sub:
                return user
        return None

    def get_user(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    def get_profile(self, user_id: str) -> Optional[Profile]:
        return self.profiles.get(user_id)

    def get_settings(self, user_id: str) -> Optional[UserSettings]:
        return self.settings.get(user_id)

    def get_github_account(self, user_id: str) -> Optional[GitHubAccount]:
        return self.github_accounts.get(user_id)

    def set_github_account(self, account: GitHubAccount) -> None:
        self.github_accounts[account.user_id] = account

    def delete_github_account(self, user_id: str) -> None:
        self.github_accounts.pop(user_id, None)

    def add_prediction_record(self, record: PredictionRecord) -> None:
        self.predictions.setdefault(record.user_id, []).append(record)

    def get_prediction_history(self, user_id: str) -> List[PredictionRecord]:
        return self.predictions.get(user_id, [])


store = InMemoryStore()
