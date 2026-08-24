from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.models.store import User, store
from app.schemas.settings import SettingsOut, SettingsUpdateRequest
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


def _get_settings_or_404(user_id: str):
    settings_record = store.get_settings(user_id)
    if settings_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found.")
    return settings_record


@router.get("", response_model=SettingsOut)
def get_settings(current_user: User = Depends(get_current_user)) -> SettingsOut:
    settings_record = _get_settings_or_404(current_user.id)
    return settings_service.get_settings(current_user, settings_record)


@router.put("", response_model=SettingsOut)
def update_settings(
    payload: SettingsUpdateRequest, current_user: User = Depends(get_current_user)
) -> SettingsOut:
    settings_record = _get_settings_or_404(current_user.id)
    return settings_service.update_settings(current_user, settings_record, payload)
