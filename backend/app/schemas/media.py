
from datetime import datetime

from pydantic import BaseModel


# Response sau khi Upload anh
class MediaUploadResponse(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    url: str
    mime_type: str
    size_bytes: int


# Response thong tin mot hinh anh
class MediaResponse(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    url: str
    mime_type: str
    size_bytes: int
    created_at: datetime


# Response danh sach hinh anh
class MediaListResponse(BaseModel):
    items: list[MediaResponse]
    total: int
    skip: int
    limit: int
