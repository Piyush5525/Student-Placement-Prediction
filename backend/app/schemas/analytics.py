from __future__ import annotations

from typing import List

from pydantic import BaseModel


class SkillGrowthPoint(BaseModel):
    skill: str
    current: int
    benchmark: int


class SalaryTrendPoint(BaseModel):
    date: str
    salary_lpa: float


class PlacementTrendPoint(BaseModel):
    date: str
    probability: int


class ScoreCategory(BaseModel):
    label: str
    value: int


class AnalyticsOut(BaseModel):
    """Superset of the user's literal example
    (`skills_growth`, `salary_trend`, `placement_trend`)."""

    skills_growth: List[SkillGrowthPoint]
    salary_trend: List[SalaryTrendPoint]
    placement_trend: List[PlacementTrendPoint]
    score_categories: List[ScoreCategory]
