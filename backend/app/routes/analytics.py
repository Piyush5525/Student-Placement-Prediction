from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.store import User
from app.schemas.analytics import AnalyticsOut
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(current_user: User = Depends(get_current_user)) -> AnalyticsOut:
    """TEMPORARY MOCK — static data, no analysis engine behind it."""
    return analytics_service.get_analytics()
