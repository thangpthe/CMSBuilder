
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str | None
    role: str
    is_active: bool
    created_at: datetime


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    skip: int
    limit: int
