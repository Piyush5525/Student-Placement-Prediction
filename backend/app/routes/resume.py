from fastapi import APIRouter, Depends, UploadFile, status

from app.auth.dependencies import get_current_user
from app.models.store import User
from app.schemas.resume import ResumeAnalysisOut, ResumeUploadResponse
from app.services import resume_service
from app.utils.file_validation import read_and_validate_upload

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile, current_user: User = Depends(get_current_user)
) -> ResumeUploadResponse:
    contents = await read_and_validate_upload(file)
    return resume_service.record_upload(
        user_id=current_user.id,
        filename=file.filename or "resume",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(contents),
    )


@router.get("", response_model=ResumeAnalysisOut)
def get_resume_analysis(current_user: User = Depends(get_current_user)) -> ResumeAnalysisOut:
    return resume_service.get_analysis()
