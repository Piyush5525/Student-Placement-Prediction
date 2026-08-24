from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.store import User
from app.schemas.recommendations import RecommendationsOut
from app.services import recommendations_service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationsOut)
def get_recommendations(current_user: User = Depends(get_current_user)) -> RecommendationsOut:
    """TEMPORARY MOCK — static data, no recommendation engine behind it."""
    return recommendations_service.get_recommendations()
