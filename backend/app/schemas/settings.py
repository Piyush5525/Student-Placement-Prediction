from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class NotificationSettings(BaseModel):
    new_prediction: bool = True
    weekly_digest: bool = True
    recommendation_alerts: bool = False


class AppearanceSettings(BaseModel):
    theme: str = "dark"  # "dark" | "light" | "system"
    density: str = "comfortable"  # "comfortable" | "compact"
    reduced_motion: bool = False


class PrivacySettings(BaseModel):
    data_sharing_enabled: bool = False


class SettingsOut(BaseModel):
    email: str
    notifications: NotificationSettings
    appearance: AppearanceSettings
    privacy: PrivacySettings


class SettingsUpdateRequest(BaseModel):
    """Partial patch — any subset of sections may be sent."""

    notifications: Optional[NotificationSettings] = None
    appearance: Optional[AppearanceSettings] = None
    privacy: Optional[PrivacySettings] = None

    class Config:
        extra = "ignore"
