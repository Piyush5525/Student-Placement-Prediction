from typing import List, Optional

from app.models.store import Profile
from app.schemas.dashboard import DashboardOut, InputSummary, InsightItem
from app.schemas.prediction import PredictionHistoryEntry
from app.services import prediction_service

# Dataset means (same source as prediction_service._DATASET_MEANS) and each
# field's real trained-model importance (models/metadata.json
# feature_importance) — used only to phrase a plain-language "this sits
# above/below average, and the model weighs it heavily" observation. Never
# a second prediction, never a causal claim.
_FEATURE_INFO = {
    "cgpa": {"label": "CGPA", "mean": 7.698, "importance": 0.1183, "higher_is_better": True},
    "backlogs": {"label": "Backlogs", "mean": 1.738, "importance": 0.8226, "higher_is_better": False},
    "skills": {"label": "Skills score", "mean": 7.555, "importance": 0.0251, "higher_is_better": True},
    "tenth_percentage": {"label": "10th percentage", "mean": 74.502, "importance": 0.0065, "higher_is_better": True},
    "workshops_certifications": {"label": "Workshops/certifications", "mean": 2.027, "importance": 0.0064, "higher_is_better": True},
    "twelfth_percentage": {"label": "12th percentage", "mean": 69.159, "importance": 0.0051, "higher_is_better": True},
    "communication_skill_rating": {"label": "Communication skill rating", "mean": 4.324, "importance": 0.0025, "higher_is_better": True},
    "mini_projects": {"label": "Mini projects", "mean": 1.013, "importance": 0.0025, "higher_is_better": True},
    "major_projects": {"label": "Major projects", "mean": 1.049, "importance": 0.0002, "higher_is_better": True},
}

_TOP_N_INSIGHTS = 3


def _build_insights(profile: Profile) -> List[InsightItem]:
    """Picks the model's most-important features (by trained
    feature_importance) and reports whether this student sits above or
    below the dataset average on each — worded as an association the model
    picked up on, never as a guarantee or causal claim."""
    scored = []
    for field, info in _FEATURE_INFO.items():
        value = getattr(profile, field, None)
        if value is None:
            continue
        above_mean = value >= info["mean"]
        favorable = above_mean if info["higher_is_better"] else not above_mean
        scored.append((info["importance"], field, info, value, favorable))

    scored.sort(key=lambda t: t[0], reverse=True)

    insights = []
    for _, field, info, value, favorable in scored[:_TOP_N_INSIGHTS]:
        direction = "above" if value >= info["mean"] else "below"
        tone = "strong" if favorable else "watch"
        explanation = (
            f"Your {info['label']} ({value:g}) is {direction} the dataset average of "
            f"{info['mean']:.1f}. Based on the trained model, this is one of the "
            f"factors most strongly associated with placement predictions."
        )
        insights.append(InsightItem(label=info["label"], tone=tone, explanation=explanation))
    return insights


def _build_input_summary(profile: Profile) -> Optional[InputSummary]:
    if profile.internship is None:  # onboarding not completed — no ML fields set yet
        return None
    return InputSummary(
        cgpa=profile.cgpa,
        major_projects=profile.major_projects,
        workshops_certifications=profile.workshops_certifications,
        mini_projects=profile.mini_projects,
        skills=profile.skills,
        communication_skill_rating=profile.communication_skill_rating,
        twelfth_percentage=profile.twelfth_percentage,
        tenth_percentage=profile.tenth_percentage,
        backlogs=profile.backlogs,
        internship=profile.internship,
        hackathon=profile.hackathon,
    )


def get_dashboard(user_id: str, profile: Profile, onboarding_complete: bool) -> DashboardOut:
    history = prediction_service.get_history(user_id)
    latest: Optional[PredictionHistoryEntry] = history[-1] if history else None
    input_summary = _build_input_summary(profile)
    insights = _build_insights(profile) if input_summary else []

    return DashboardOut(
        student_name=profile.name,
        branch=profile.branch,
        college_tier=profile.college_tier,
        onboarding_complete=onboarding_complete,
        latest_prediction=latest,
        input_summary=input_summary,
        history=history,
        insights=insights,
    )
