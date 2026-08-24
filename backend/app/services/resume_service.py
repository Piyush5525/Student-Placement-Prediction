from datetime import datetime, timezone

from app.models.store import ResumeRecord, store
from app.schemas.resume import (
    KeywordEntry,
    ResumeAnalysisOut,
    ResumeSectionAudit,
    ResumeUploadResponse,
    ResumeVersion,
)

_MOCK_KEYWORDS = [
    KeywordEntry(id="k1", keyword="React", severity="matched", section="Skills"),
    KeywordEntry(id="k2", keyword="TypeScript", severity="matched", section="Skills"),
    KeywordEntry(id="k3", keyword="REST APIs", severity="matched", section="Experience"),
    KeywordEntry(id="k4", keyword="System Design", severity="missing", section="Skills"),
    KeywordEntry(id="k5", keyword="Docker", severity="missing", section="Skills"),
    KeywordEntry(id="k6", keyword="Unit Testing", severity="weak", section="Experience"),
    KeywordEntry(id="k7", keyword="CI/CD", severity="missing", section="Experience"),
    KeywordEntry(id="k8", keyword="Data Structures", severity="matched", section="Education"),
    KeywordEntry(id="k9", keyword="SQL", severity="weak", section="Skills"),
]

_MOCK_SECTION_AUDIT = [
    ResumeSectionAudit(
        id="s1", section="Summary", status="present",
        your_resume="2-line summary present",
        expected="A 2-3 line summary tailored to the target role",
    ),
    ResumeSectionAudit(
        id="s2", section="Skills", status="weak",
        your_resume="9 skills listed, no proficiency levels",
        expected="8-12 skills grouped by category (languages / frameworks / tools)",
    ),
    ResumeSectionAudit(
        id="s3", section="Experience", status="present",
        your_resume="2 entries, quantified impact on 1",
        expected="Each entry has 2-4 bullet points with a measurable outcome",
    ),
    ResumeSectionAudit(
        id="s4", section="Projects", status="present",
        your_resume="3 projects listed with tech stacks",
        expected="2-4 projects with tech stack + measurable outcome",
    ),
    ResumeSectionAudit(
        id="s5", section="Education", status="present",
        your_resume="Complete with CGPA",
        expected="Institution, degree, CGPA, graduation year",
    ),
    ResumeSectionAudit(
        id="s6", section="Certifications", status="missing",
        your_resume="None listed",
        expected="At least 1 relevant certification strengthens ATS match",
    ),
]

_MOCK_VERSIONS = [
    ResumeVersion(id="v3", label="resume_v3_final.pdf", uploaded_at="2026-08-10", ats_score=72),
    ResumeVersion(id="v2", label="resume_v2.pdf", uploaded_at="2026-06-02", ats_score=61),
    ResumeVersion(id="v1", label="resume_v1.pdf", uploaded_at="2026-03-14", ats_score=48),
]


def record_upload(user_id: str, filename: str, content_type: str, size_bytes: int) -> ResumeUploadResponse:
    resume_id = store.new_id("resume")
    now = datetime.now(timezone.utc)
    store.resumes[resume_id] = ResumeRecord(
        id=resume_id,
        user_id=user_id,
        filename=filename,
        size_bytes=size_bytes,
        content_type=content_type,
        uploaded_at=now,
    )
    return ResumeUploadResponse(
        resume_id=resume_id,
        filename=filename,
        size_bytes=size_bytes,
        content_type=content_type,
        uploaded_at=now.isoformat(),
    )


def get_analysis() -> ResumeAnalysisOut:
    """Static mock analysis, independent of any uploaded file — resume
    parsing/ATS scoring is explicitly out of scope for this pass."""
    return ResumeAnalysisOut(
        ats_score=72,
        ats_verdict="Good ATS compatibility — a few structural gaps hold it back from Strong.",
        keywords=_MOCK_KEYWORDS,
        section_audit=_MOCK_SECTION_AUDIT,
        versions=_MOCK_VERSIONS,
    )
