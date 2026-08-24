"""Reusable FastAPI auth dependencies."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import TokenError, decode_token
from app.models.store import User, store

bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> User:
    """Extracts + verifies the Bearer access token, returns the User.

    Raises 401 if the header is missing, malformed, expired, or refers to
    a user that no longer exists in the in-memory store.
    """
    if credentials is None or not credentials.credentials:
        raise _unauthorized("Not authenticated — missing bearer token.")

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenError as exc:
        raise _unauthorized(f"Invalid or expired access token: {exc}") from exc

    user_id = payload.get("sub")
    user = store.get_user(user_id) if user_id else None
    if user is None:
        raise _unauthorized("User for this token no longer exists.")

    return user
