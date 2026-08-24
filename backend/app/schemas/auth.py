from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class GoogleAuthRequest(BaseModel):
    """The SPA sends the authorization `code` it received from Google's
    consent-screen redirect. The code exchange (which needs
    GOOGLE_CLIENT_SECRET) happens server-side in app/auth/google_oauth.py —
    the secret never reaches the browser. See that module's docstring for
    the full auth-code-vs-ID-token rationale."""

    code: str = Field(min_length=1)


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    onboarding_complete: bool
    auth_provider: str
    google_linked: bool
    google_email: Optional[str] = None
    google_picture: Optional[str] = None
    has_password: bool


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
