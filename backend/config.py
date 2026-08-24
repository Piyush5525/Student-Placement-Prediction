from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/config.py -> repo root is one level up
_REPO_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Central app config, sourced from environment variables / .env.

    No `.env` is required to boot: every field has a workable default so the
    API layer (the point of this pass) is always testable. Google OAuth is
    the one feature that's genuinely inert without real credentials — see
    `app/auth/google_oauth.py`, which checks `google_oauth_configured` below
    and returns a clear 503 instead of crashing when they're absent.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # JWT
    secret_key: str = "dev-only-insecure-secret-key-change-in-env-file"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:5173/auth/google/callback"

    # GitHub OAuth (account linking — a logged-in student connects their
    # GitHub profile from Settings; this is never a login method).
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    github_redirect_uri: str = "http://localhost:5173/app/settings/github/callback"

    # CORS — comma-separated origins in the env var
    cors_origins: str = "http://localhost:5173"

    # Resume upload
    max_resume_size_mb: int = 5

    # Placement prediction ML model — trained by the repo-root train.py,
    # artifacts live in <repo root>/models/ by default.
    ml_models_dir: str = str(_REPO_ROOT / "models")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def google_oauth_configured(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret)

    @property
    def github_oauth_configured(self) -> bool:
        return bool(self.github_client_id and self.github_client_secret)


settings = Settings()
