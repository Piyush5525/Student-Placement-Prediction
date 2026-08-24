from __future__ import annotations

from typing import List, Tuple

from pydantic import BaseModel


class RecommendedCompany(BaseModel):
    id: str
    name: str
    industry: str
    fit_score: int
    salary_range_lpa: Tuple[float, float]
    required_skills: List[str]
    matched_skills: List[str]
    logo_initial: str


class RecommendedSkill(BaseModel):
    id: str
    skill: str
    current: int
    target: int
    priority: str
    suggestion: str


class RecommendationsOut(BaseModel):
    """Superset of the user's literal example
    (`companies`, `skills`)."""

    companies: List[RecommendedCompany]
    skills: List[RecommendedSkill]
