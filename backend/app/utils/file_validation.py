from fastapi import HTTPException, UploadFile, status

from config import settings

ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}


def validate_resume_extension(filename: str) -> None:
    lower = filename.lower()
    if not any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF, DOC, and DOCX files are accepted.",
        )


def validate_resume_size(size_bytes: int) -> None:
    max_bytes = settings.max_resume_size_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.max_resume_size_mb}MB size limit.",
        )
    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )


async def read_and_validate_upload(file: UploadFile) -> bytes:
    """Validates extension, reads the full file into memory, then validates
    size against the actual byte count (not a client-supplied Content-Length
    header, which can't be trusted)."""
    validate_resume_extension(file.filename or "")
    contents = await file.read()
    validate_resume_size(len(contents))
    return contents
