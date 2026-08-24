"""Real inference for the trained placement model.

Loads the sklearn pipeline artifacts (model, scaler, target encoder, and
metadata) produced by the repo-root `train.py` exactly once at import time —
not on every request — and reuses them for every prediction. See
config.ml_models_dir for the artifact location.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Dict, List

import joblib
import pandas as pd

from app.models.store import PredictionRecord, Profile, store
from app.schemas.prediction import (
    FactorContribution,
    PredictionHistoryEntry,
    PredictionOut,
    PredictionRequest,
)
from config import settings

logger = logging.getLogger("app.prediction")

_MODELS_DIR = Path(settings.ml_models_dir)

_model = joblib.load(_MODELS_DIR / "placement_model.pkl")
_scaler = joblib.load(_MODELS_DIR / "scaler.pkl")
_target_encoder = joblib.load(_MODELS_DIR / "target_encoder.pkl")
with open(_MODELS_DIR / "metadata.json") as _f:
    _metadata = json.load(_f)

_FEATURE_ORDER: List[str] = _metadata["feature_order"]
_NUMERIC_FEATURES: List[str] = _metadata["numeric_features"]
_BINARY_FEATURES: List[str] = _metadata["binary_features"]
_BINARY_MAP: Dict[str, int] = _metadata["binary_map"]
_TARGET_CLASSES: List[str] = _metadata["target_classes"]  # index-aligned with model output
_FEATURE_IMPORTANCE: Dict[str, float] = _metadata["feature_importance"]

# "Placed" index in the model's own class ordering — never assumed to be 1.
_PLACED_INDEX = _TARGET_CLASSES.index("Placed")

logger.info(
    "Loaded placement model '%s' from %s (feature_order=%s)",
    _metadata.get("best_model_name"),
    _MODELS_DIR,
    _FEATURE_ORDER,
)

# Maps the PredictionRequest's snake_case field names to the model's
# original training column names, and gives each a human label + dataset
# mean for factor-contribution scoring below.
_FIELD_MAP = {
    "cgpa": "CGPA",
    "major_projects": "Major Projects",
    "workshops_certifications": "Workshops/Certifications",
    "mini_projects": "Mini Projects",
    "skills": "Skills",
    "communication_skill_rating": "Communication Skill Rating",
    "twelfth_percentage": "12th Percentage",
    "tenth_percentage": "10th Percentage",
    "backlogs": "backlogs",
    "internship": "Internship",
    "hackathon": "Hackathon",
}

# Training-set means, used only to phrase each feature's contribution to
# THIS prediction as "above/below the typical applicant" — not used by the
# model itself (the model only ever sees the scaler's fitted mean/std).
_DATASET_MEANS = {
    "CGPA": 7.698, "Major Projects": 1.049, "Workshops/Certifications": 2.027,
    "Mini Projects": 1.013, "Skills": 7.555, "Communication Skill Rating": 4.324,
    "12th Percentage": 69.159, "10th Percentage": 74.502, "backlogs": 1.738,
    "Internship": 0.585, "Hackathon": 0.732,
}

_FRIENDLY_LABEL = {
    "CGPA": "CGPA", "Major Projects": "Major Projects",
    "Workshops/Certifications": "Workshops/Certifications", "Mini Projects": "Mini Projects",
    "Skills": "Skills", "Communication Skill Rating": "Communication Skill",
    "12th Percentage": "12th Percentage", "10th Percentage": "10th Percentage",
    "backlogs": "Backlogs", "Internship": "Internship", "Hackathon": "Hackathon",
}


def _verdict(placement_probability: float) -> str:
    if placement_probability >= 75:
        return "Strong chance of placement"
    if placement_probability >= 45:
        return "Moderate chance of placement"
    return "At-risk — focus on your highest-impact gaps"


def _chance_category(placement_probability: float) -> str:
    """User-friendly bucketing of the real probability — NOT a second model
    output. Fixed thresholds: 0-40 Low, 41-70 Moderate, 71-100 High."""
    if placement_probability >= 71:
        return "High Chance"
    if placement_probability >= 41:
        return "Moderate Chance"
    return "Low Chance"


def _confidence(placement_probability: float) -> str:
    """0-50% -> Low, 50-75% -> Medium, 75-100% -> High, using the model's
    own confidence in whichever class it predicted (i.e. distance from the
    50/50 boundary), not just the raw placement probability."""
    margin = max(placement_probability, 100 - placement_probability)
    if margin >= 75:
        return "High"
    if margin >= 50:
        return "Medium"
    return "Low"


def _compute_factors(row: Dict[str, float]) -> List[FactorContribution]:
    """Signed, per-prediction factor contributions: each feature's global
    importance from training (metadata.json) scaled by how far this
    applicant's value sits from the dataset average, in the direction that
    matches the model's known effect (backlogs is the model's one inverse
    relationship — more backlogs pushes toward NotPlaced, everything else
    pushes toward Placed when above average)."""
    contributions = []
    for col in _FEATURE_ORDER:
        importance = _FEATURE_IMPORTANCE.get(col, 0.0)
        mean = _DATASET_MEANS[col]
        value = row[col]
        deviation = value - mean
        direction = -1 if col == "backlogs" else 1
        raw_score = importance * deviation * direction
        contributions.append((col, raw_score, value, mean))

    max_abs = max((abs(c[1]) for c in contributions), default=1.0) or 1.0

    factors: List[FactorContribution] = []
    for col, raw_score, value, mean in contributions:
        impact = round((raw_score / max_abs) * 20)  # scale to a readable +/-20 band
        label = _FRIENDLY_LABEL[col]
        if col in _BINARY_FEATURES:
            state = "Yes" if value >= 0.5 else "No"
            explanation = f"{label}: {state} (typical applicant: {mean*100:.0f}% say Yes)."
        else:
            comparison = "above" if value >= mean else "below"
            explanation = f"Your {label} ({value:g}) is {comparison} the typical applicant's {mean:.1f}."
        factors.append(FactorContribution(label=label, impact=impact, explanation=explanation))

    factors.sort(key=lambda f: abs(f.impact), reverse=True)
    return factors[:6]


def run_prediction(payload: PredictionRequest) -> PredictionOut:
    row = {
        "CGPA": payload.cgpa,
        "Major Projects": payload.major_projects,
        "Workshops/Certifications": payload.workshops_certifications,
        "Mini Projects": payload.mini_projects,
        "Skills": payload.skills,
        "Communication Skill Rating": payload.communication_skill_rating,
        "12th Percentage": payload.twelfth_percentage,
        "10th Percentage": payload.tenth_percentage,
        "backlogs": payload.backlogs,
        "Internship": _BINARY_MAP[payload.internship],
        "Hackathon": _BINARY_MAP[payload.hackathon],
    }

    X = pd.DataFrame([row])[_FEATURE_ORDER]
    X[_NUMERIC_FEATURES] = _scaler.transform(X[_NUMERIC_FEATURES])

    proba = _model.predict_proba(X)[0]  # index-aligned with _TARGET_CLASSES
    placed_prob = float(proba[_PLACED_INDEX]) * 100
    not_placed_prob = 100 - placed_prob

    pred_class_index = int(proba.argmax())
    pred_label = _TARGET_CLASSES[pred_class_index]

    factors = _compute_factors(row)

    return PredictionOut(
        prediction=pred_label,
        placement_probability=round(placed_prob, 2),
        not_placed_probability=round(not_placed_prob, 2),
        confidence=_confidence(placed_prob),
        chance_category=_chance_category(placed_prob),
        verdict=_verdict(placed_prob),
        factors=factors,
    )


def log_prediction(user_id: str, result: PredictionOut) -> None:
    """Persists a real prediction result to the user's history (in-memory,
    see app/models/store.py). Called after every POST /prediction and
    POST /onboarding run — never for What-If Simulator scenario previews on
    the standalone prediction page, which call run_prediction() directly."""
    store.add_prediction_record(
        PredictionRecord(
            id=store.new_id("pred"),
            user_id=user_id,
            prediction=result.prediction,
            placement_probability=result.placement_probability,
            not_placed_probability=result.not_placed_probability,
            confidence=result.confidence,
            chance_category=result.chance_category,
        )
    )


def get_history(user_id: str) -> List[PredictionHistoryEntry]:
    records = store.get_prediction_history(user_id)
    return [
        PredictionHistoryEntry(
            id=r.id,
            prediction=r.prediction,
            placement_probability=r.placement_probability,
            not_placed_probability=r.not_placed_probability,
            confidence=r.confidence,
            chance_category=r.chance_category,
            created_at=r.created_at.isoformat(),
        )
        for r in records
    ]


def request_from_profile(profile: Profile) -> PredictionRequest:
    """Builds a PredictionRequest from a Profile's ML-input fields — used to
    re-run the model after "Update Details". Raises if onboarding hasn't
    been completed (any of the 11 fields still None)."""
    return PredictionRequest(
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
