import logging

from fastapi import FastAPI

from app.api.router import api_router
from app.middleware.cors import add_cors_middleware
from app.middleware.error_handling import add_exception_handlers
from app.models.store import store
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.startup")

app = FastAPI(
    title="Placement Prediction API",
    description=(
        "API layer for the Student Placement Prediction platform. "
        "POST /prediction runs the real trained placement model "
        "(scikit-learn Gradient Boosting, loaded once at startup from "
        "<repo root>/models/). Analytics/Recommendations are still temporary "
        "mock endpoints. Data is in-memory only; nothing survives a process "
        "restart."
    ),
    version="0.1.0",
)

add_cors_middleware(app)
add_exception_handlers(app)
app.include_router(api_router)


@app.on_event("startup")
def seed_demo_prediction_history() -> None:
    """Runs the real model once against the seeded demo profile so the
    dashboard has a non-empty history on first load. Deferred to here
    (rather than store.py's constructor) because prediction_service imports
    `store` itself — calling it during InMemoryStore.__init__ would be a
    circular import before `store` exists."""
    from app.services import prediction_service

    demo_id = "user-demo-001"
    profile = store.get_profile(demo_id)
    if profile is None or store.get_prediction_history(demo_id):
        return
    request = prediction_service.request_from_profile(profile)
    result = prediction_service.run_prediction(request)
    prediction_service.log_prediction(demo_id, result)


@app.on_event("startup")
def warn_if_oauth_unconfigured() -> None:
    if not settings.google_oauth_configured:
        logger.warning(
            "Google OAuth is NOT configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET "
            "missing from backend/.env). Every endpoint except POST /auth/google "
            "will work normally; that one will return 503 until credentials are set. "
            "See backend/.env.example for the required variables."
        )
    if not settings.github_oauth_configured:
        logger.warning(
            "GitHub OAuth is NOT configured (GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET "
            "missing from backend/.env). Every endpoint except "
            "POST /integrations/github/connect will work normally; that one will "
            "return 503 until credentials are set. See backend/.env.example."
        )
    logger.info("Demo login: demo@example.com / password123")


@app.get("/", tags=["health"])
def root() -> dict:
    return {"status": "ok", "service": "placement-prediction-api"}


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}
