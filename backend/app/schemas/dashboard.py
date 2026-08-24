from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from app.schemas.prediction import PredictionHistoryEntry


class InputSummary(BaseModel):
    """The 11 ML fields as currently on the student's profile — read-only
    display for the dashboard's "your submitted information" section."""

    cgpa: float
    major_projects: int
    workshops_certifications: int
    mini_projects: int
    skills: int
    communication_skill_rating: float
    twelfth_percentage: float
    tenth_percentage: float
    backlogs: int
    internship: str
    hackathon: str


class InsightItem(BaseModel):
    label: str
    tone: str  # "strong" | "watch" — see dashboard_service._insight_tone
    explanation: str


class DashboardOut(BaseModel):
    """Student-focused dashboard: the student's own latest prediction,
    their submitted inputs, prediction history, and honest feature-based
    insights. No company data, no unrelated mock content."""

    student_name: str
    branch: str
    college_tier: str
    onboarding_complete: bool

    latest_prediction: Optional[PredictionHistoryEntry] = None
    input_summary: Optional[InputSummary] = None
    history: List[PredictionHistoryEntry] = []
    insights: List[InsightItem] = []
