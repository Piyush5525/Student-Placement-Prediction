from __future__ import annotations

from app.schemas.prediction import PredictionOut, PredictionRequest


class OnboardingRequest(PredictionRequest):
    """Identical shape to PredictionRequest — the 11 ML features — but
    submitted once at signup-time onboarding. Kept as a distinct type
    (rather than reusing PredictionRequest directly in the route) so the
    onboarding endpoint's OpenAPI docs read clearly as its own step, even
    though validation is identical."""


class OnboardingResponse(PredictionOut):
    """Onboarding returns the same fields as a normal prediction — the
    first prediction result — plus nothing else. onboarding_complete is
    reported via the user object already returned from auth endpoints, not
    duplicated here."""
