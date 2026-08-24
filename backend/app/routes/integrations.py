"""Third-party account linking for an already-authenticated user. GitHub is
the only provider implemented — LinkedIn is explicitly out of scope.
"""
from typing import Union

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_current_user
from app.models.store import User
from app.schemas.github import GitHubAccountOut, GitHubConnectRequest, GitHubNotConnectedOut
from app.services import github_service

router = APIRouter(prefix="/integrations/github", tags=["integrations"])


@router.post("/connect", response_model=GitHubAccountOut, status_code=status.HTTP_201_CREATED)
async def connect_github(
    payload: GitHubConnectRequest, current_user: User = Depends(get_current_user)
) -> GitHubAccountOut:
    return await github_service.connect_github(current_user.id, payload.code)


@router.get("", response_model=Union[GitHubAccountOut, GitHubNotConnectedOut])
def get_github(current_user: User = Depends(get_current_user)):
    return github_service.get_github_account(current_user.id)


@router.post("/resync", response_model=GitHubAccountOut)
async def resync_github(current_user: User = Depends(get_current_user)) -> GitHubAccountOut:
    return await github_service.resync_github(current_user.id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def disconnect_github(current_user: User = Depends(get_current_user)) -> None:
    github_service.disconnect_github(current_user.id)
