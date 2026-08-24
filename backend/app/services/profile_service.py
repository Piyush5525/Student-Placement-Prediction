from app.models.store import Profile
from app.schemas.profile import ProfileOut, ProfileUpdateRequest


def _completeness(profile: Profile) -> int:
    """Every field in the mock profile counts as filled, so completeness
    reads as high but not 100% — matches the frontend's mock behavior
    (mockProfileCompleteness = 92) rather than a real derived calculation."""
    return 92


def get_profile(profile: Profile) -> ProfileOut:
    return ProfileOut(
        name=profile.name,
        email=profile.email,
        branch=profile.branch,
        college_tier=profile.college_tier,
        batch_year=profile.batch_year,
        cgpa=profile.cgpa,
        internships_count=profile.internships_count,
        projects_count=profile.projects_count,
        certifications_count=profile.certifications_count,
        coding_skill_score=profile.coding_skill_score,
        aptitude_score=profile.aptitude_score,
        communication_skill_score=profile.communication_skill_score,
        logical_reasoning_score=profile.logical_reasoning_score,
        hackathons_participated=profile.hackathons_participated,
        github_repos=profile.github_repos,
        linkedin_connections=profile.linkedin_connections,
        mock_interview_score=profile.mock_interview_score,
        attendance_percentage=profile.attendance_percentage,
        backlogs=profile.backlogs,
        extracurricular_score=profile.extracurricular_score,
        leadership_score=profile.leadership_score,
        sleep_hours=profile.sleep_hours,
        study_hours_per_day=profile.study_hours_per_day,
        member_since=profile.member_since,
        profile_completeness=_completeness(profile),
        major_projects=profile.major_projects,
        mini_projects=profile.mini_projects,
        workshops_certifications=profile.workshops_certifications,
        skills=profile.skills,
        communication_skill_rating=profile.communication_skill_rating,
        twelfth_percentage=profile.twelfth_percentage,
        tenth_percentage=profile.tenth_percentage,
        internship=profile.internship,
        hackathon=profile.hackathon,
    )


def update_profile(profile: Profile, patch: ProfileUpdateRequest) -> ProfileOut:
    updates = patch.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in updates.items():
        setattr(profile, field, value)
    return get_profile(profile)
