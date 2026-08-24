from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.models.store import User, store
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse
from app.services import onboarding_service

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("", response_model=OnboardingResponse)
def submit_onboarding(
    payload: OnboardingRequest, current_user: User = Depends(get_current_user)
) -> OnboardingResponse:
    """First-time student parameter collection: writes the 11 ML fields to
    the profile, marks the account onboarded, and returns the first real
    prediction (also logged to history)."""
    profile = store.get_profile(current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return onboarding_service.submit_onboarding(current_user, profile, payload)
