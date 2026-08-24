from __future__ import annotations

from typing import List

from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    size_bytes: int
    content_type: str
    uploaded_at: str
    status: str = "uploaded"
    message: str = "Resume received and stored. Analysis below reflects mock/demo data, not this file."


class KeywordEntry(BaseModel):
    id: str
    keyword: str
    severity: str  # "matched" | "missing" | "weak"
    section: str


class ResumeSectionAudit(BaseModel):
    id: str
    section: str
    status: str  # "present" | "weak" | "missing"
    your_resume: str
    expected: str


class ResumeVersion(BaseModel):
    id: str
    label: str
    uploaded_at: str
    ats_score: int


class ResumeAnalysisOut(BaseModel):
    """Static mock analysis — NOT derived from any uploaded file, per the
    "do not analyze the resume yet" requirement. Returned as-is regardless
    of what (if anything) was previously uploaded."""

    ats_score: int
    ats_verdict: str
    keywords: List[KeywordEntry]
    section_audit: List[ResumeSectionAudit]
    versions: List[ResumeVersion]
