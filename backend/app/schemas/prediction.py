from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel, Field

BinaryFlag = Literal["Yes", "No"]


class PredictionRequest(BaseModel):
    """Input for the trained placement model — every field below is one of
    the 11 features the model was actually trained on (see
    models/metadata.json `feature_order`). All fields are required: the
    model has no defaults of its own, so a partial input would silently
    mean "dataset mean," which is not a real prediction."""

    cgpa: float = Field(ge=0, le=10)
    major_projects: int = Field(ge=0, le=20)
    workshops_certifications: int = Field(ge=0, le=20)
    mini_projects: int = Field(ge=0, le=20)
    skills: int = Field(ge=0, le=20)
    communication_skill_rating: float = Field(ge=0, le=5)
    twelfth_percentage: float = Field(ge=0, le=100)
    tenth_percentage: float = Field(ge=0, le=100)
    backlogs: int = Field(ge=0, le=20)
    internship: BinaryFlag
    hackathon: BinaryFlag

    class Config:
        extra = "ignore"


class FactorContribution(BaseModel):
    label: str
    impact: int
    explanation: str


class PredictionOut(BaseModel):
    """Real output of the trained model's predict_proba() — no mock
    arithmetic. `prediction` and the two probabilities are read directly off
    the model's target_classes mapping (see prediction_service.py), never
    assumed. `chance_category` is not a second model output — it's a fixed,
    documented bucketing of `placement_probability` (see
    prediction_service._chance_category): 0-40 Low, 41-70 Moderate,
    71-100 High."""

    prediction: Literal["Placed", "NotPlaced"]
    placement_probability: float
    not_placed_probability: float
    confidence: Literal["Low", "Medium", "High"]
    chance_category: Literal["Low Chance", "Moderate Chance", "High Chance"]
    verdict: str
    factors: List[FactorContribution]


class PredictionHistoryEntry(BaseModel):
    id: str
    prediction: Literal["Placed", "NotPlaced"]
    placement_probability: float
    not_placed_probability: float
    confidence: Literal["Low", "Medium", "High"]
    chance_category: Literal["Low Chance", "Moderate Chance", "High Chance"]
    created_at: str
