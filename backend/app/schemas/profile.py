from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class ProfileOut(BaseModel):
    name: str
    email: EmailStr
    branch: str
    college_tier: str
    batch_year: int
    cgpa: float
    internships_count: int
    projects_count: int
    certifications_count: int
    coding_skill_score: int
    aptitude_score: int
    communication_skill_score: int
    logical_reasoning_score: int
    hackathons_participated: int
    github_repos: int
    linkedin_connections: int
    mock_interview_score: int
    attendance_percentage: int
    backlogs: int
    extracurricular_score: int
    leadership_score: int
    sleep_hours: float
    study_hours_per_day: float
    member_since: str
    profile_completeness: int

    # Placement model inputs — None until onboarding is completed.
    major_projects: Optional[int] = None
    mini_projects: Optional[int] = None
    workshops_certifications: Optional[int] = None
    skills: Optional[int] = None
    communication_skill_rating: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    tenth_percentage: Optional[float] = None
    internship: Optional[str] = None
    hackathon: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    """All fields optional — PUT /profile applies a partial patch, matching
    the frontend's InlineEditField pattern (one field saved at a time)."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    branch: Optional[str] = None
    college_tier: Optional[str] = None
    cgpa: Optional[float] = Field(default=None, ge=0, le=10)
    backlogs: Optional[int] = Field(default=None, ge=0)
    attendance_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    internships_count: Optional[int] = Field(default=None, ge=0)
    projects_count: Optional[int] = Field(default=None, ge=0)
    certifications_count: Optional[int] = Field(default=None, ge=0)
    hackathons_participated: Optional[int] = Field(default=None, ge=0)
    github_repos: Optional[int] = Field(default=None, ge=0)
    linkedin_connections: Optional[int] = Field(default=None, ge=0)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    study_hours_per_day: Optional[float] = Field(default=None, ge=0, le=24)

    # Placement model inputs (see app/models/store.py Profile) — used by
    # onboarding and the dashboard's "Update Details" flow.
    major_projects: Optional[int] = Field(default=None, ge=0, le=20)
    mini_projects: Optional[int] = Field(default=None, ge=0, le=20)
    workshops_certifications: Optional[int] = Field(default=None, ge=0, le=20)
    skills: Optional[int] = Field(default=None, ge=0, le=20)
    communication_skill_rating: Optional[float] = Field(default=None, ge=0, le=5)
    twelfth_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    tenth_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    internship: Optional[Literal["Yes", "No"]] = None
    hackathon: Optional[Literal["Yes", "No"]] = None

    class Config:
        extra = "ignore"
