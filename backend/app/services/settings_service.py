from app.models.store import User, UserSettings
from app.schemas.settings import (
    AppearanceSettings,
    NotificationSettings,
    PrivacySettings,
    SettingsOut,
    SettingsUpdateRequest,
)


def get_settings(user: User, settings_record: UserSettings) -> SettingsOut:
    return SettingsOut(
        email=user.email,
        notifications=NotificationSettings(**settings_record.notifications),
        appearance=AppearanceSettings(
            theme=settings_record.theme,
            density=settings_record.density,
            reduced_motion=settings_record.reduced_motion_override,
        ),
        privacy=PrivacySettings(data_sharing_enabled=settings_record.data_sharing_enabled),
    )


def update_settings(user: User, settings_record: UserSettings, patch: SettingsUpdateRequest) -> SettingsOut:
    if patch.notifications is not None:
        settings_record.notifications = patch.notifications.model_dump()
    if patch.appearance is not None:
        settings_record.theme = patch.appearance.theme
        settings_record.density = patch.appearance.density
        settings_record.reduced_motion_override = patch.appearance.reduced_motion
    if patch.privacy is not None:
        settings_record.data_sharing_enabled = patch.privacy.data_sharing_enabled
    return get_settings(user, settings_record)
