"""Real Google OAuth2 Authorization Code flow — no mocking.

Contract chosen: the SPA sends the **authorization code** it received from
Google's consent screen redirect (not an ID token). Why auth-code over
implicit/ID-token-only:
  - The code-exchange happens server-side, so GOOGLE_CLIENT_SECRET never
    reaches the browser (a real security requirement — the ID-token-only
    "One Tap" style flow avoids this but pushes more trust onto the
    frontend's own token verification and doesn't naturally hand us a
    refresh-capable exchange).
  - It matches the "real Authorization Code exchange" wording in the spec
    directly: POST /auth/google exchanges `code` for tokens with Google,
    then verifies the returned ID token, then upserts the local user.

If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not configured, every
function here raises GoogleOAuthNotConfigured so the route can return a
clean 503 instead of the app crashing at import time or at request time
with an opaque error.
"""
from __future__ import annotations

from typing import Any, Dict

import httpx
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from config import settings

GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"


class GoogleOAuthNotConfigured(Exception):
    """Raised when GOOGLE_CLIENT_ID/SECRET are missing from the environment."""


class GoogleOAuthError(Exception):
    """Raised when Google rejects the code exchange or the token is invalid."""


def _require_configured() -> None:
    if not settings.google_oauth_configured:
        raise GoogleOAuthNotConfigured(
            "Google OAuth is not configured on this server — "
            "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are unset."
        )


async def exchange_code_for_tokens(auth_code: str) -> Dict[str, Any]:
    """Exchange an authorization `code` for Google's token response
    (access_token, id_token, refresh_token, ...) via the standard OAuth2
    token endpoint. Raises GoogleOAuthError on any non-2xx response.
    """
    _require_configured()

    data = {
        "code": auth_code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": settings.google_redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(GOOGLE_TOKEN_ENDPOINT, data=data)

    if response.status_code != 200:
        raise GoogleOAuthError(
            f"Google token exchange failed ({response.status_code}): {response.text}"
        )

    return response.json()


def verify_google_id_token(id_token_str: str) -> Dict[str, Any]:
    """Verify a Google-issued ID token's signature/audience/issuer and
    return its decoded claims (sub, email, name, ...).
    """
    _require_configured()

    try:
        claims = google_id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), settings.google_client_id
        )
    except ValueError as exc:
        raise GoogleOAuthError(f"Invalid Google ID token: {exc}") from exc

    return claims


async def authenticate_with_google_code(auth_code: str) -> Dict[str, Any]:
    """Full flow: exchange code -> verify id_token -> return user claims."""
    token_response = await exchange_code_for_tokens(auth_code)
    id_token_str = token_response.get("id_token")
    if not id_token_str:
        raise GoogleOAuthError("Google token response did not include an id_token.")
    return verify_google_id_token(id_token_str)
