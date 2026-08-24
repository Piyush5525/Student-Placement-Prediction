from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.models.store import User, store
from app.schemas.profile import ProfileOut, ProfileUpdateRequest
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


def _get_profile_or_404(user_id: str):
    profile = store.get_profile(user_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return profile


@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)) -> ProfileOut:
    profile = _get_profile_or_404(current_user.id)
    return profile_service.get_profile(profile)


@router.put("", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdateRequest, current_user: User = Depends(get_current_user)
) -> ProfileOut:
    profile = _get_profile_or_404(current_user.id)
    if payload.name is not None:
        current_user.name = payload.name
    return profile_service.update_profile(profile, payload)
