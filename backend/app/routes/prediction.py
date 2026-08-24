from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.models.store import User, store
from app.schemas.prediction import PredictionHistoryEntry, PredictionOut, PredictionRequest
from app.services import prediction_service

router = APIRouter(prefix="/prediction", tags=["prediction"])


@router.post("", response_model=PredictionOut)
def run_prediction(
    payload: PredictionRequest,
    save_to_history: bool = False,
    current_user: User = Depends(get_current_user),
) -> PredictionOut:
    """Runs the trained placement model (loaded once at startup — see
    prediction_service) against the submitted profile and returns the real
    predict_proba() output.

    `save_to_history=true` logs the result to the student's prediction
    history — used by onboarding and "Update Details". The What-If
    Simulator on the standalone prediction page calls this with the default
    `false` for every scenario tweak, since those are exploratory previews,
    not real submitted predictions worth keeping a permanent record of.
    """
    result = prediction_service.run_prediction(payload)
    if save_to_history:
        prediction_service.log_prediction(current_user.id, result)
    return result


@router.get("/history", response_model=List[PredictionHistoryEntry])
def get_prediction_history(current_user: User = Depends(get_current_user)) -> List[PredictionHistoryEntry]:
    """Every saved (save_to_history=true) prediction for this student,
    oldest first."""
    return prediction_service.get_history(current_user.id)


@router.post("/rerun", response_model=PredictionOut)
def rerun_from_profile(current_user: User = Depends(get_current_user)) -> PredictionOut:
    """Re-runs the model from the student's CURRENT profile fields and logs
    it to history — used by the dashboard's "Update Details" flow: the
    frontend edits fields via PUT /profile, then calls this to get a fresh,
    saved prediction without re-sending all 11 values a second time."""
    profile = store.get_profile(current_user.id)
    if profile is None or profile.internship is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete onboarding before requesting a prediction.",
        )
    request = prediction_service.request_from_profile(profile)
    result = prediction_service.run_prediction(request)
    prediction_service.log_prediction(current_user.id, result)
    return result
