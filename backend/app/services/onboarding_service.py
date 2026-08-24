from app.models.store import Profile, User
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse
from app.services import prediction_service


def submit_onboarding(user: User, profile: Profile, payload: OnboardingRequest) -> OnboardingResponse:
    """Writes the 11 ML fields onto the student's profile, marks onboarding
    complete, runs the real model, and logs the result as their first
    prediction history entry."""
    profile.cgpa = payload.cgpa
    profile.major_projects = payload.major_projects
    profile.workshops_certifications = payload.workshops_certifications
    profile.mini_projects = payload.mini_projects
    profile.skills = payload.skills
    profile.communication_skill_rating = payload.communication_skill_rating
    profile.twelfth_percentage = payload.twelfth_percentage
    profile.tenth_percentage = payload.tenth_percentage
    profile.backlogs = payload.backlogs
    profile.internship = payload.internship
    profile.hackathon = payload.hackathon

    user.onboarding_complete = True

    result = prediction_service.run_prediction(payload)
    prediction_service.log_prediction(user.id, result)

    return OnboardingResponse(**result.model_dump())
