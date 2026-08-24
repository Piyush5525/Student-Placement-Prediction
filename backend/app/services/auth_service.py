"""Business logic for signup/login/Google auth/refresh/logout. Routes stay
thin and call into this module; this module is the only place that touches
the in-memory store's user table for auth purposes.
"""
from fastapi import HTTPException, status

from app.auth.google_oauth import (
    GoogleOAuthError,
    GoogleOAuthNotConfigured,
    authenticate_with_google_code,
)
from app.auth.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.store import User, store
from app.schemas.auth import TokenResponse, UserOut


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        onboarding_complete=user.onboarding_complete,
        auth_provider=user.auth_provider,
        google_linked=user.google_linked,
        google_email=user.google_email,
        google_picture=user.google_picture,
        has_password=user.hashed_password is not None,
    )


def _issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=_user_out(user),
    )


def signup(name: str, email: str, password: str) -> TokenResponse:
    if store.get_user_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = store.create_user(
        email=email,
        name=name,
        hashed_password=hash_password(password),
        auth_provider="password",
        onboarding_complete=False,
    )
    return _issue_tokens(user)


def login(email: str, password: str) -> TokenResponse:
    user = store.get_user_by_email(email)
    if user is None or user.hashed_password is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    return _issue_tokens(user)


async def login_with_google(auth_code: str) -> TokenResponse:
    try:
        claims = await authenticate_with_google_code(auth_code)
    except GoogleOAuthNotConfigured as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Google sign-in is not configured on this server yet. "
                "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env."
            ),
        ) from exc
    except GoogleOAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google sign-in failed: {exc}",
        ) from exc

    google_sub = claims.get("sub")
    email = claims.get("email")
    picture = claims.get("picture")
    name = claims.get("name") or (email.split("@")[0] if email else "Student")

    if not google_sub or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google did not return the expected profile claims.",
        )

    user = store.get_user_by_google_sub(google_sub)
    if user is None:
        # No Google-linked account yet — reuse an existing password account
        # with the same email if present, otherwise create a new one.
        user = store.get_user_by_email(email)
        if user is None:
            user = store.create_user(
                email=email,
                name=name,
                hashed_password=None,
                auth_provider="google",
                google_sub=google_sub,
                google_email=email,
                google_picture=picture,
                onboarding_complete=False,
            )
        else:
            user.google_sub = google_sub
            user.google_email = email
            user.google_picture = picture
    else:
        # Already linked — refresh the cached email/picture in case they
        # changed on Google's side since the last login.
        user.google_email = email
        user.google_picture = picture

    return _issue_tokens(user)


def refresh_access_token(refresh_token: str) -> str:
    if refresh_token in store.revoked_refresh_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This refresh token has been revoked. Please log in again.",
        )
    try:
        payload = decode_token(refresh_token, expected_type="refresh")
    except TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired refresh token: {exc}",
        ) from exc

    user_id = payload.get("sub")
    user = store.get_user(user_id) if user_id else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User for this refresh token no longer exists.",
        )
    return create_access_token(user.id)


def logout(refresh_token: str) -> None:
    """Adds the refresh token to an in-memory revocation set. Note the
    documented limitation: any ACCESS token already issued from this
    refresh token remains valid until its own short expiry, since there's
    no server-side access-token revocation store in this in-memory pass —
    only refresh-token revocation, which stops new access tokens being
    minted from it."""
    if refresh_token:
        store.revoked_refresh_tokens.add(refresh_token)


def get_current_user_out(user: User) -> UserOut:
    return _user_out(user)


def disconnect_google(user: User) -> UserOut:
    """Unlinks Google as a sign-in method. Refused with 400 if the account
    has no password set — disconnecting would otherwise permanently lock
    the user out, since Google was their only way to authenticate."""
    if not user.google_linked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Google account is linked.",
        )
    if user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Can't disconnect Google — this account has no password set, "
                "so Google is the only way to sign in. Set a password first."
            ),
        )
    user.google_sub = None
    user.google_email = None
    user.google_picture = None
    return _user_out(user)
