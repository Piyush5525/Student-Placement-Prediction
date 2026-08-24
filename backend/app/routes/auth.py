from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_current_user
from app.models.store import User
from app.schemas.auth import (
    AccessTokenResponse,
    GoogleAuthRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
    UserOut,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest) -> TokenResponse:
    """Not in the original endpoint list — added because the frontend
    already has a fully-built signup page (`signup-page.tsx`) with no
    endpoint to call. Leaving it unwired would mean shipping a broken
    "Create account" button, which the "no blank/broken pages" spirit of
    prior sessions' work rules out. Mirrors /auth/login's response shape."""
    return auth_service.signup(payload.name, payload.email, payload.password)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    return auth_service.login(payload.email, payload.password)


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleAuthRequest) -> TokenResponse:
    return await auth_service.login_with_google(payload.code)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(payload: RefreshRequest) -> AccessTokenResponse:
    """Not in the original endpoint list — added because "Token refresh" is
    an explicit technical requirement, and a refresh flow needs an endpoint
    to refresh against. Exchanges a valid, non-revoked refresh token for a
    new access token without requiring the user to log in again."""
    access_token = auth_service.refresh_access_token(payload.refresh_token)
    return AccessTokenResponse(access_token=access_token)


@router.post("/logout", response_model=MessageResponse)
def logout(payload: LogoutRequest) -> MessageResponse:
    if payload.refresh_token:
        auth_service.logout(payload.refresh_token)
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return auth_service.get_current_user_out(current_user)


@router.delete("/google", response_model=UserOut)
def disconnect_google(current_user: User = Depends(get_current_user)) -> UserOut:
    return auth_service.disconnect_google(current_user)
