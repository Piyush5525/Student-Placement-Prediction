"""Aggregates every domain router into one — main.py mounts just this."""
from fastapi import APIRouter

from app.routes import (
    analytics,
    auth,
    dashboard,
    integrations,
    onboarding,
    prediction,
    profile,
    recommendations,
    resume,
    settings,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(resume.router)
api_router.include_router(dashboard.router)
api_router.include_router(onboarding.router)
api_router.include_router(prediction.router)
api_router.include_router(analytics.router)
api_router.include_router(recommendations.router)
api_router.include_router(settings.router)
api_router.include_router(integrations.router)
